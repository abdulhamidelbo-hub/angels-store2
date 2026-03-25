import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/contexts/AppContext';
import { Card } from '../../src/components/Common';
import { COLORS } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function StatsScreen() {
  const { todayStats } = useApp();

  const statCards = [
    {
      title: 'إجمالي التسبيحات',
      value: todayStats?.total_tasbeeh || 0,
      icon: 'flash',
      color: COLORS.primary,
    },
    {
      title: 'عد باللمس',
      value: todayStats?.touch_tasbeeh_count || 0,
      icon: 'hand-left',
      color: COLORS.accent,
    },
    {
      title: 'عد بالصوت',
      value: todayStats?.voice_tasbeeh_count || 0,
      icon: 'mic',
      color: COLORS.secondary,
    },
    {
      title: 'مساعد ذكي',
      value: todayStats?.ai_tasbeeh_count || 0,
      icon: 'sparkles',
      color: '#FF6B6B',
    },
    {
      title: 'نقاط XP',
      value: todayStats?.xp_earned || 0,
      icon: 'star',
      color: '#FFD700',
    },
    {
      title: 'أذكار مكتملة',
      value: todayStats?.completed_azkar_count || 0,
      icon: 'checkmark-circle',
      color: '#4CAF50',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إحصائيات اليوم</Text>
        <Text style={styles.headerSubtitle}>تتبع تقدمك اليومي</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {statCards.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}
              >
                <Ionicons name={stat.icon as any} size={28} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressTitle}>تقدمك اليوم</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    ((todayStats?.total_tasbeeh || 0) / 100) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {todayStats?.total_tasbeeh || 0} / 100 تسبيحة
          </Text>
        </Card>

        {/* Motivational Card */}
        <Card style={styles.motivationalCard}>
          <Ionicons name="heart" size={32} color={COLORS.primary} />
          <Text style={styles.motivationalText}>
            بارك الله فيك! استمر في الذكر واجمع المزيد من الحسنات
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressCard: {
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  motivationalCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  motivationalText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
});
