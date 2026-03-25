import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  trial: { label: 'تجريبي', color: '#2196F3' },
  active: { label: 'مدفوع', color: ADMIN_COLORS.success },
  exemption: { label: 'معفى', color: ADMIN_COLORS.accent },
  expired: { label: 'منتهي', color: ADMIN_COLORS.warning },
};

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.adminListUsers({ search: search || undefined, page });
      setUsers(data.items);
      setTotalPages(data.pages);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, [search, page]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubscriptionAction = (user: any, action: string) => {
    const labels: Record<string, string> = {
      grant_lifetime: 'منح اشتراك مدى الحياة',
      grant_year: 'منح اشتراك سنة',
      cancel: 'إلغاء الاشتراك',
      grant_exemption: 'منح الإعفاء',
    };
    Alert.alert('تأكيد', `هل تريد ${labels[action]} لهذا المستخدم؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: async () => {
        try {
          await apiService.adminUpdateUserSubscription(user.user_id, { action });
          Alert.alert('نجاح', 'تم تحديث الاشتراك'); loadData();
        } catch (e) { Alert.alert('خطأ', 'حدث خطأ'); }
      }},
    ]);
  };

  const handleBan = (user: any) => {
    const isBanned = user.is_banned;
    Alert.alert(isBanned ? 'إلغاء الحظر' : 'حظر المستخدم',
      isBanned ? 'هل تريد إلغاء حظر هذا المستخدم؟' : 'هل تريد حظر هذا المستخدم؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', style: isBanned ? 'default' : 'destructive', onPress: async () => {
        try {
          await apiService.adminBanUser(user.user_id, { is_banned: !isBanned });
          Alert.alert('نجاح', isBanned ? 'تم إلغاء الحظر' : 'تم الحظر'); loadData();
        } catch (e) { Alert.alert('خطأ', 'حدث خطأ'); }
      }},
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={ADMIN_COLORS.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="بحث بالمعرف..." value={search} onChangeText={setSearch} onSubmitEditing={() => { setPage(1); loadData(); }} />
        </View>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {users.map((user, index) => {
          const statusInfo = STATUS_LABELS[user.subscription_status] || STATUS_LABELS.trial;
          return (
            <View key={user.user_id || index} style={[styles.userCard, user.is_banned && styles.bannedCard]}>
              <View style={styles.userTop}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color={ADMIN_COLORS.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userId} numberOfLines={1}>{user.user_id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
              </View>
              {user.is_banned && <View style={styles.banNotice}><Ionicons name="ban" size={16} color={ADMIN_COLORS.warning} /><Text style={styles.banText}>محظور</Text></View>}
              <View style={styles.userMeta}>
                <Text style={styles.metaItem}>التسجيل: {user.install_date ? new Date(user.install_date).toLocaleDateString('ar-SA') : '-'}</Text>
                {user.is_lifetime && <Text style={[styles.metaItem, { color: ADMIN_COLORS.success }]}>مدى الحياة</Text>}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionChip} onPress={() => handleSubscriptionAction(user, 'grant_year')}>
                  <Text style={styles.actionChipText}>سنة مجانية</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionChip} onPress={() => handleSubscriptionAction(user, 'grant_lifetime')}>
                  <Text style={styles.actionChipText}>مدى الحياة</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionChip, { backgroundColor: ADMIN_COLORS.warning + '15' }]} onPress={() => handleBan(user)}>
                  <Text style={[styles.actionChipText, { color: ADMIN_COLORS.warning }]}>{user.is_banned ? 'إلغاء الحظر' : 'حظر'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]} onPress={() => page > 1 && setPage(page - 1)} disabled={page <= 1}>
              <Text style={styles.pageBtnText}>السابق</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
            <TouchableOpacity style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]} onPress={() => page < totalPages && setPage(page + 1)} disabled={page >= totalPages}>
              <Text style={styles.pageBtnText}>التالي</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchContainer: { padding: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN_COLORS.card, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: ADMIN_COLORS.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, textAlign: 'right' },
  list: { flex: 1, paddingHorizontal: 12 },
  userCard: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  bannedCard: { borderLeftWidth: 4, borderLeftColor: ADMIN_COLORS.warning },
  userTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: ADMIN_COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userInfo: { flex: 1 },
  userId: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.text, marginBottom: 4 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '600' },
  banNotice: { flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN_COLORS.warning + '15', padding: 8, borderRadius: 8, marginBottom: 8, gap: 6 },
  banText: { fontSize: 13, color: ADMIN_COLORS.warning, fontWeight: '600' },
  userMeta: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: { fontSize: 12, color: ADMIN_COLORS.textSecondary },
  actionsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionChip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: ADMIN_COLORS.primary + '15', borderRadius: 8 },
  actionChipText: { fontSize: 12, color: ADMIN_COLORS.primary, fontWeight: '600' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 16 },
  pageBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: ADMIN_COLORS.primary, borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: ADMIN_COLORS.border },
  pageBtnText: { color: '#fff', fontWeight: '600' },
  pageInfo: { fontSize: 14, color: ADMIN_COLORS.textSecondary },
});
