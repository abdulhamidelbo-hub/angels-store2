import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ADMIN_COLORS } from '../../src/constants/adminColors';
import { apiService } from '../../src/services/api';

const MENU_ITEMS = [
  { key: 'azkar', title: 'إدارة الأذكار', icon: 'book', route: '/admin/azkar' },
  { key: 'events', title: 'إدارة المناسبات', icon: 'calendar', route: '/admin/events' },
  { key: 'challenges', title: 'إدارة التحديات', icon: 'trophy', route: '/admin/challenges' },
  { key: 'users', title: 'إدارة المستخدمين', icon: 'people', route: '/admin/users' },
  { key: 'exemptions', title: 'طلبات الإعفاء', icon: 'hand-right', route: '/admin/exemptions' },
  { key: 'notifications', title: 'الإشعارات', icon: 'notifications', route: '/admin/notifications' },
  { key: 'settings', title: 'الإعدادات', icon: 'settings', route: '/admin/admin-settings' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await apiService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>لوحة تحكم المالك</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome */}
        <View style={styles.welcomeCard}>
          <Ionicons name="shield-checkmark" size={32} color={ADMIN_COLORS.accent} />
          <Text style={styles.welcomeTitle}>مرحباً أيها المالك</Text>
          <Text style={styles.welcomeSubtitle}>لوحة التحكم الشاملة لتطبيق أذكار المسلم</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="people" label="المستخدمين" value={stats?.total_users || 0} color={ADMIN_COLORS.primary} />
          <StatCard icon="today" label="نشطين اليوم" value={stats?.active_today || 0} color="#2196F3" />
          <StatCard icon="hand-right" label="التسبيحات" value={stats?.total_tasbeeh || 0} color={ADMIN_COLORS.accent} />
          <StatCard icon="star" label="النقاط (XP)" value={stats?.total_xp || 0} color="#FF9800" />
          <StatCard icon="book" label="الأذكار" value={stats?.total_azkar || 0} color="#9C27B0" />
          <StatCard icon="calendar" label="المناسبات" value={stats?.total_events || 0} color="#00BCD4" />
          <StatCard icon="card" label="مشتركين مدفوعين" value={stats?.paid_users || 0} color={ADMIN_COLORS.success} />
          <StatCard icon="heart" label="طلبات الإعفاء" value={stats?.exemption_users || 0} color={ADMIN_COLORS.warning} />
        </View>

        {/* Pending Alert */}
        {stats?.pending_exemptions > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => router.push('/admin/exemptions')}
          >
            <Ionicons name="alert-circle" size={24} color={ADMIN_COLORS.warning} />
            <Text style={styles.alertText}>
              يوجد {stats.pending_exemptions} طلب إعفاء بانتظار المراجعة
            </Text>
            <Ionicons name="chevron-forward" size={20} color={ADMIN_COLORS.warning} />
          </TouchableOpacity>
        )}

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>الإدارة</Text>
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={28} color={ADMIN_COLORS.primary} />
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon as any} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value.toLocaleString()}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: ADMIN_COLORS.textSecondary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  welcomeCard: {
    backgroundColor: ADMIN_COLORS.card, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: ADMIN_COLORS.text, marginTop: 8 },
  welcomeSubtitle: { fontSize: 14, color: ADMIN_COLORS.textSecondary, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    width: '48%', backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14,
    marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: ADMIN_COLORS.text },
  statLabel: { fontSize: 12, color: ADMIN_COLORS.textSecondary, marginTop: 2 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0',
    borderRadius: 12, padding: 14, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: ADMIN_COLORS.warning,
  },
  alertText: { flex: 1, fontSize: 14, color: ADMIN_COLORS.warning, marginHorizontal: 10, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text, marginBottom: 12 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  menuItem: {
    width: '48%', backgroundColor: ADMIN_COLORS.card, borderRadius: 14, padding: 18,
    marginBottom: 12, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  menuIconContainer: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: ADMIN_COLORS.primary + '15',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  menuItemTitle: { fontSize: 14, fontWeight: '600', color: ADMIN_COLORS.text, textAlign: 'center' },
});
