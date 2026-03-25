import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { THEME } from '../../src/constants/theme';
import { useApp } from '../../src/contexts/AppContext';

const { width } = Dimensions.get('window');

interface StatBoxProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ title, value, icon, color }) => {
  return (
    <View style={styles.statBox}>
      <View style={[styles.statBoxInner, { backgroundColor: color }]}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
  label: string;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, color }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>
        <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { backgroundColor: color, width: `${progress}%` }]} />
      </View>
    </View>
  );
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { todayStats } = useApp();

  const stats = [
    {
      title: 'تسبيحات اليوم',
      value: todayStats?.total_tasbeeh || 0,
      icon: 'heart' as const,
      color: THEME.colors.primary,
    },
    {
      title: 'نقاط XP',
      value: todayStats?.xp_earned || 0,
      icon: 'star' as const,
      color: THEME.colors.gold,
    },
    {
      title: 'أذكار مكتملة',
      value: todayStats?.completed_azkar_count || 0,
      icon: 'checkmark-circle' as const,
      color: '#00B894',
    },
    {
      title: 'سلسلة الأيام',
      value: todayStats?.streak_days || 0,
      icon: 'flame' as const,
      color: '#FF6B6B',
    },
  ];

  const achievements = [
    { label: 'أذكار الصباح', progress: 75, color: THEME.colors.primary },
    { label: 'أذكار المساء', progress: 60, color: '#764BA2' },
    { label: 'تحدي الأسبوع', progress: 40, color: THEME.colors.gold },
    { label: 'هدف الشهر', progress: 25, color: '#FF6B6B' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={THEME.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={styles.headerTitle}>إحصائياتي</Text>
          <Text style={styles.headerSubtitle}>تتبع تقدمك اليومي</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatBox
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </View>

        {/* Achievements Section */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>تقدم الإنجازات</Text>
          <View style={styles.achievementsCard}>
            {achievements.map((achievement) => (
              <ProgressBar
                key={achievement.label}
                label={achievement.label}
                progress={achievement.progress}
                color={achievement.color}
              />
            ))}
          </View>
        </Animated.View>

        {/* Weekly Summary */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>ملخص الأسبوع</Text>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyRow}>
              {['الس', 'الأ', 'الث', 'الر', 'الخ', 'الج', 'الس'].map((day, index) => (
                <View key={index} style={styles.weeklyDay}>
                  <View
                    style={[
                      styles.weeklyDot,
                      index < 4 && styles.weeklyDotActive,
                      index === 3 && styles.weeklyDotToday,
                    ]}
                  >
                    {index < 4 && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#FFFFFF"
                      />
                    )}
                  </View>
                  <Text style={styles.weeklyDayText}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.lg,
  },
  statBox: {
    width: (width - THEME.spacing.md * 2 - THEME.spacing.sm) / 2,
    marginBottom: THEME.spacing.sm,
  },
  statBoxInner: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 130,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  achievementsCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xs,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.colors.text,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  progressBg: {
    height: 8,
    backgroundColor: THEME.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weeklyDay: {
    alignItems: 'center',
  },
  weeklyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xs,
  },
  weeklyDotActive: {
    backgroundColor: THEME.colors.primary,
  },
  weeklyDotToday: {
    backgroundColor: THEME.colors.gold,
  },
  weeklyDayText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
});
