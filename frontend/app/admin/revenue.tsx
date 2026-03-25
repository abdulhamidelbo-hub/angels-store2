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

export default function AdminRevenue() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await apiService.getRevenueStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading revenue:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ADMIN_COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الإيرادات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
      >
        {/* Revenue Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="cash" size={28} color={ADMIN_COLORS.success} />
            <Text style={[styles.summaryValue, { color: ADMIN_COLORS.success }]}>
              ${stats?.total_revenue?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>إجمالي الإيرادات</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="trending-up" size={28} color="#2196F3" />
            <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
              ${stats?.monthly_revenue?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.summaryLabel}>هذا الشهر</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="people" size={28} color="#FF9800" />
            <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
              {stats?.paid_subscribers || 0}
            </Text>
            <Text style={styles.summaryLabel}>مشتركين مدفوعين</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF8E1' }]}>
            <Ionicons name="heart" size={28} color="#FFD700" />
            <Text style={[styles.summaryValue, { color: '#8B4513' }]}>
              {stats?.exemption_users || 0}
            </Text>
            <Text style={styles.summaryLabel}>معفيين</Text>
          </View>
        </View>

        {/* Monthly Revenue Chart */}
        <Text style={styles.sectionTitle}>الإيرادات الشهرية</Text>
        <View style={styles.chartCard}>
          {stats?.monthly_chart?.map((item: any, index: number) => {
            const maxRevenue = Math.max(...(stats?.monthly_chart?.map((c: any) => c.revenue) || [1]), 1);
            const barWidth = maxRevenue > 0 ? Math.max(8, (item.revenue / maxRevenue) * 100) : 8;
            return (
              <View key={index} style={styles.chartRow}>
                <Text style={styles.chartMonth}>{item.month?.slice(5) || ''}</Text>
                <View style={styles.chartBarBg}>
                  <View style={[styles.chartBar, { width: `${barWidth}%` }]} />
                </View>
                <Text style={styles.chartValue}>${item.revenue?.toFixed(2)}</Text>
                <Text style={styles.chartCount}>{item.count} عملية</Text>
              </View>
            );
          })}
        </View>

        {/* Recent Purchases */}
        <Text style={styles.sectionTitle}>آخر المشتريات</Text>
        {(!stats?.recent_purchases || stats.recent_purchases.length === 0) ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt" size={40} color={ADMIN_COLORS.textSecondary} />
            <Text style={styles.emptyText}>لا توجد مشتريات بعد</Text>
            <Text style={styles.emptySubtext}>ستظهر هنا بعد تفعيل RevenueCat</Text>
          </View>
        ) : (
          stats.recent_purchases.map((purchase: any, index: number) => (
            <View key={index} style={styles.purchaseCard}>
              <View style={styles.purchaseTop}>
                <View style={styles.storeBadge}>
                  <Ionicons
                    name={purchase.store === 'app_store' ? 'logo-apple' : 'logo-google-playstore'}
                    size={16}
                    color={ADMIN_COLORS.primary}
                  />
                  <Text style={styles.storeBadgeText}>
                    {purchase.store === 'app_store' ? 'App Store' : 'Play Store'}
                  </Text>
                </View>
                <Text style={styles.purchasePrice}>${purchase.price?.toFixed(2)}</Text>
              </View>
              <Text style={styles.purchaseUser}>المستخدم: {purchase.user_id}</Text>
              <Text style={styles.purchaseDate}>
                {purchase.created_at ? new Date(purchase.created_at).toLocaleDateString('ar-SA') : '-'}
              </Text>
            </View>
          ))
        )}

        {/* Payment Setup Status */}
        <Text style={styles.sectionTitle}>حالة الإعداد</Text>
        <View style={styles.setupCard}>
          <SetupItem icon="card" title="RevenueCat" configured={false} description="تكامل الدفع داخل التطبيق" />
          <View style={styles.setupDivider} />
          <SetupItem icon="logo-apple" title="App Store Connect" configured={false} description="متجر أبل" />
          <View style={styles.setupDivider} />
          <SetupItem icon="logo-google-playstore" title="Google Play Console" configured={false} description="متجر جوجل" />
          <View style={styles.setupDivider} />
          <SetupItem icon="wallet" title="Stripe" configured={false} description="استلام الأموال" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SetupItem = ({ icon, title, configured, description }: any) => (
  <View style={styles.setupItem}>
    <Ionicons name={icon} size={24} color={configured ? ADMIN_COLORS.success : ADMIN_COLORS.textSecondary} />
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.setupItemTitle}>{title}</Text>
      <Text style={styles.setupItemDesc}>{description}</Text>
    </View>
    <View style={[styles.setupStatus, { backgroundColor: configured ? ADMIN_COLORS.success + '20' : '#FFF3E0' }]}>
      <Text style={[styles.setupStatusText, { color: configured ? ADMIN_COLORS.success : '#FF9800' }]}>
        {configured ? 'مفعّل' : 'غير مفعّل'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ADMIN_COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: ADMIN_COLORS.headerBg, paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  list: { flex: 1, padding: 12 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 16, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  summaryLabel: { fontSize: 12, color: ADMIN_COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.text, marginBottom: 10, marginTop: 16 },
  chartCard: {
    backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  chartMonth: { width: 30, fontSize: 11, color: ADMIN_COLORS.textSecondary, textAlign: 'center' },
  chartBarBg: { flex: 1, height: 16, backgroundColor: '#F0F0F0', borderRadius: 8, overflow: 'hidden' },
  chartBar: { height: '100%', backgroundColor: ADMIN_COLORS.success, borderRadius: 8 },
  chartValue: { width: 50, fontSize: 11, color: ADMIN_COLORS.text, textAlign: 'right' },
  chartCount: { width: 50, fontSize: 10, color: ADMIN_COLORS.textSecondary },
  emptyCard: {
    backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 30, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  emptyText: { fontSize: 16, color: ADMIN_COLORS.textSecondary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: ADMIN_COLORS.textSecondary, marginTop: 4 },
  purchaseCard: {
    backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  purchaseTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  storeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: ADMIN_COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  storeBadgeText: { fontSize: 12, color: ADMIN_COLORS.primary, fontWeight: '600' },
  purchasePrice: { fontSize: 18, fontWeight: 'bold', color: ADMIN_COLORS.success },
  purchaseUser: { fontSize: 13, color: ADMIN_COLORS.textSecondary },
  purchaseDate: { fontSize: 12, color: ADMIN_COLORS.textSecondary },
  setupCard: {
    backgroundColor: ADMIN_COLORS.card, borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  setupItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  setupItemTitle: { fontSize: 15, fontWeight: '600', color: ADMIN_COLORS.text },
  setupItemDesc: { fontSize: 12, color: ADMIN_COLORS.textSecondary, marginTop: 2 },
  setupDivider: { height: 1, backgroundColor: ADMIN_COLORS.border },
  setupStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  setupStatusText: { fontSize: 12, fontWeight: '600' },
});
