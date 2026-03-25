import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../src/constants/theme';
import { useApp } from '../../src/contexts/AppContext';
import { apiService } from '../../src/services/api';
import { IslamicEvent } from '../../src/types';
import {
  StatsCard,
  TasbeehMethodCard,
  QuickActionButton,
  AnimatedCard,
} from '../../src/components/ui';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { todayStats, refreshStats } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [nextEvent, setNextEvent] = useState<IslamicEvent | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-20);

  useEffect(() => {
    loadData();
    // Animate header
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withSpring(0, { damping: 15, stiffness: 80 });
  }, []);

  const loadData = async () => {
    try {
      await refreshStats();
      const events = await apiService.getIslamicEvents();
      if (events && events.length > 0) {
        setNextEvent(events[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const tasbeehMethods = [
    {
      title: 'باللمس',
      description: 'اضغط للتسبيح',
      icon: 'hand-left' as const,
      gradient: THEME.gradients.primary,
      route: '/tasbeeh/touch',
    },
    {
      title: 'بالصوت',
      description: 'قل وسيُعدّ',
      icon: 'mic' as const,
      gradient: THEME.gradients.gold,
      route: '/tasbeeh/voice',
    },
    {
      title: 'المساعد الذكي',
      description: 'AI مساعد',
      icon: 'sparkles' as const,
      gradient: ['#667eea', '#764ba2'] as const,
      route: '/tasbeeh/ai',
    },
  ];

  const quickActions = [
    { title: 'الأذكار', icon: 'book' as const, route: '/(tabs)/categories', color: THEME.colors.primary },
    { title: 'مواقيت الصلاة', icon: 'time' as const, route: '/prayer-times', color: THEME.colors.gold },
    { title: 'التحديات', icon: 'trophy' as const, route: '/challenges', color: '#FF6B6B' },
    { title: 'الاشتراك', icon: 'diamond' as const, route: '/subscription', color: '#667eea' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Gradient Header */}
      <LinearGradient
        colors={THEME.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View style={[styles.headerContent, headerStyle]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.subtitle}>بسم الله نبدأ يومنا</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              router.push('/notifications' as any);
            }}
          >
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
      >
        {/* Stats Card */}
        <View style={styles.statsContainer}>
          <StatsCard
            totalTasbeeh={todayStats?.total_tasbeeh || 0}
            xpEarned={todayStats?.xp_earned || 0}
            completedAzkar={todayStats?.completed_azkar_count || 0}
          />
        </View>

        {/* Tasbeeh Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طرق التسبيح</Text>
          <View style={styles.tasbeehRow}>
            {tasbeehMethods.map((method, index) => (
              <TasbeehMethodCard
                key={method.route}
                title={method.title}
                description={method.description}
                icon={method.icon}
                gradient={method.gradient}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(method.route as any);
                }}
                delay={index * 100}
              />
            ))}
          </View>
        </View>

        {/* Next Event */}
        {nextEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المناسبة القادمة</Text>
            <AnimatedCard
              delay={200}
              onPress={() => router.push(`/events/${nextEvent.id}` as any)}
            >
              <View style={styles.eventContent}>
                <LinearGradient
                  colors={THEME.gradients.sunrise}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.eventIconContainer}
                >
                  <Ionicons name="calendar" size={28} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.eventTextContainer}>
                  <Text style={styles.eventTitle}>{nextEvent.name_ar}</Text>
                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {nextEvent.description_ar || 'اضغط للمزيد من التفاصيل'}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color={THEME.colors.textMuted}
                />
              </View>
            </AnimatedCard>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وصول سريع</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action, index) => (
              <QuickActionButton
                key={action.route}
                title={action.title}
                icon={action.icon}
                color={action.color}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as any);
                }}
                delay={index * 80}
              />
            ))}
          </View>
        </View>

        {/* Daily Motivation */}
        <View style={styles.section}>
          <AnimatedCard
            delay={400}
            gradient={['#F9F7F0', '#FFFFFF'] as const}
          >
            <View style={styles.motivationContent}>
              <View style={styles.motivationIcon}>
                <Ionicons name="leaf" size={24} color={THEME.colors.primary} />
              </View>
              <Text style={styles.motivationText}>
                "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ"
              </Text>
              <Text style={styles.motivationSource}>حديث شريف</Text>
            </View>
          </AnimatedCard>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 32 }} />
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
    paddingBottom: THEME.spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 8,
  },
  statsContainer: {
    marginTop: 12,
  },
  section: {
    marginBottom: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  tasbeehRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  motivationContent: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  motivationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  motivationText: {
    fontSize: 18,
    color: THEME.colors.text,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
    paddingHorizontal: THEME.spacing.md,
  },
  motivationSource: {
    fontSize: 14,
    color: THEME.colors.gold,
    marginTop: THEME.spacing.sm,
    fontWeight: '600',
  },
});
