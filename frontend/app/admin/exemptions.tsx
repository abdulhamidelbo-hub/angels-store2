import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

const STATUS_COLORS: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: '#FF9800', label: 'قيد المراجعة', icon: 'time' },
  approved: { color: ADMIN_COLORS.success, label: 'تمت الموافقة', icon: 'checkmark-circle' },
  rejected: { color: ADMIN_COLORS.warning, label: 'مرفوض', icon: 'close-circle' },
};

export default function AdminExemptions() {
  const router = useRouter();
  const [exemptions, setExemptions] = useState<any[]>([]);
  const [exemptionStats, setExemptionStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [exData, statsData] = await Promise.all([
        apiService.adminListExemptions({ status: filter || undefined }),
        apiService.adminExemptionStats(),
      ]);
      setExemptions(exData.items);
      setExemptionStats(statsData);
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); setRefreshing(false); }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAction = (item: any, status: string) => {
    const labels = { approved: 'الموافقة على', rejected: 'رفض' };
    const label = labels[status as keyof typeof labels] || '';
    Alert.alert('تأكيد', `هل تريد ${label} هذا الطلب؟`, [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تأكيد', onPress: async () => {
        try {
          const id = item._id || item.user_id;
          await apiService.adminProcessExemption(id, { status });
          Alert.alert('نجاح', 'تم معالجة الطلب');
          loadData();
        } catch (e) { Alert.alert('خطأ', 'حدث خطأ'); }
      }},
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.center}><ActivityIndicator size="large" color={ADMIN_COLORS.primary} /></View></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>طلبات الإعفاء</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      {exemptionStats && (
        <View style={styles.statsRow}>
          <View style={styles.statBadge}><Text style={styles.statNum}>{exemptionStats.total}</Text><Text style={styles.statLabel}>إجمالي</Text></View>
          <View style={[styles.statBadge, { backgroundColor: '#E8F5E9' }]}><Text style={[styles.statNum, { color: ADMIN_COLORS.success }]}>{exemptionStats.approved}</Text><Text style={styles.statLabel}>مقبول</Text></View>
          <View style={[styles.statBadge, { backgroundColor: '#FFF3E0' }]}><Text style={[styles.statNum, { color: '#FF9800' }]}>{exemptionStats.pending}</Text><Text style={styles.statLabel}>معلق</Text></View>
          <View style={[styles.statBadge, { backgroundColor: '#FFEBEE' }]}><Text style={[styles.statNum, { color: ADMIN_COLORS.warning }]}>{exemptionStats.rejected}</Text><Text style={styles.statLabel}>مرفوض</Text></View>
        </View>
      )}

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
        {[null, 'pending', 'approved', 'rejected'].map((f) => (
          <TouchableOpacity key={f || 'all'} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterChipText, filter === f && { color: '#fff' }]}>{f ? STATUS_COLORS[f]?.label : 'الكل'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 40 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        {exemptions.length === 0 && <Text style={styles.emptyText}>لا توجد طلبات</Text>}
        {exemptions.map((item, index) => {
          const itemStatus = item.status || 'pending';
          const statusInfo = STATUS_COLORS[itemStatus] || STATUS_COLORS.pending;
          return (
            <View key={item._id || index} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.statusTag, { backgroundColor: statusInfo.color + '20' }]}>
                  <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                  <Text style={[styles.statusTagText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                </View>
                <Text style={styles.dateText}>{item.request_date ? new Date(item.request_date).toLocaleDateString('ar-SA') : '-'}</Text>
              </View>
              <Text style={styles.userIdText}>المستخدم: {item.user_id}</Text>
              {item.prayer_text && (
                <View style={styles.prayerBox}>
                  <Ionicons name="heart" size={16} color={ADMIN_COLORS.accent} />
                  <Text style={styles.prayerText}>{item.prayer_text}</Text>
                </View>
              )}
              {itemStatus === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleAction(item, 'approved')}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.approveBtnText}>موافقة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(item, 'rejected')}>
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text style={styles.rejectBtnText}>رفض</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
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
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statBadge: { flex: 1, backgroundColor: ADMIN_COLORS.card, borderRadius: 10, padding: 10, alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 'bold', color: ADMIN_COLORS.text },
  statLabel: { fontSize: 11, color: ADMIN_COLORS.textSecondary, marginTop: 2 },
  filterScroll: { maxHeight: 44, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: ADMIN_COLORS.card, borderWidth: 1, borderColor: ADMIN_COLORS.border, marginRight: 8 },
  filterChipActive: { backgroundColor: ADMIN_COLORS.primary, borderColor: ADMIN_COLORS.primary },
  filterChipText: { fontSize: 13, color: ADMIN_COLORS.textSecondary },
  list: { flex: 1, paddingHorizontal: 12 },
  emptyText: { textAlign: 'center', fontSize: 16, color: ADMIN_COLORS.textSecondary, marginTop: 40 },
  card: { backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  statusTagText: { fontSize: 12, fontWeight: '600' },
  dateText: { fontSize: 12, color: ADMIN_COLORS.textSecondary },
  userIdText: { fontSize: 13, color: ADMIN_COLORS.textSecondary, marginBottom: 8 },
  prayerBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: ADMIN_COLORS.accent + '10', padding: 12, borderRadius: 10, marginBottom: 10, gap: 8 },
  prayerText: { flex: 1, fontSize: 14, color: ADMIN_COLORS.text, textAlign: 'right', lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: 10 },
  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ADMIN_COLORS.success, paddingVertical: 10, borderRadius: 10, gap: 6 },
  approveBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: ADMIN_COLORS.warning, paddingVertical: 10, borderRadius: 10, gap: 6 },
  rejectBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
