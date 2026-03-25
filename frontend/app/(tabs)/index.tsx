import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../src/components/Common';
import { COLORS } from '../../src/constants/colors';
import { useApp } from '../../src/contexts/AppContext';
import { apiService } from '../../src/services/api';
import { IslamicEvent } from '../../src/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { todayStats, refreshStats } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [nextEvent, setNextEvent] = useState<IslamicEvent | null>(null);

  useEffect(() => {
    loadData();
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
    await loadData();
    setRefreshing(false);
  };

  const tasbeehMethods = [
    {
      title: 'العد باللمس',
      description: 'اضغط للتسبيح',
      icon: 'hand-left',
      color: COLORS.primary,
      route: '/tasbeeh/touch',
    },
    {
      title: 'العد بالصوت',
      description: 'قل وسيتم العد',
      icon: 'mic',
      color: COLORS.secondary,
      route: '/tasbeeh/voice',
    },
    {
      title: 'المساعد الذكي',
      description: 'اطلب من المساعد',
      icon: 'sparkles',
      color: COLORS.accent,
      route: '/tasbeeh/ai',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>السلام عليكم</Text>
            <Text style={styles.subtitle}>بسم الله نبدأ</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats?.total_tasbeeh || 0}</Text>
              <Text style={styles.statLabel}>تسبيحة اليوم</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats?.xp_earned || 0}</Text>
              <Text style={styles.statLabel}>نقاط XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats?.completed_azkar_count || 0}</Text>
              <Text style={styles.statLabel}>أذكار مكتملة</Text>
            </View>
          </View>
        </Card>

        {/* Tasbeeh Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طرق التسبيح</Text>
          {tasbeehMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={styles.methodCard}
              onPress={() => router.push(method.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color + '20' }]}>
                <Ionicons name={method.icon as any} size={28} color={method.color} />
              </View>
              <View style={styles.methodContent}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Event */}
        {nextEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>المناسبة القادمة</Text>
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => router.push(`/events/${nextEvent.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.eventIcon}>
                <Ionicons name="calendar" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{nextEvent.name_ar}</Text>
                <Text style={styles.eventDescription}>
                  {nextEvent.description_ar || 'اضغط للمزيد من التفاصيل'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وصول سريع</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/categories')}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="book" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>الأذكار</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/prayer-times' as any)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>مواقيت الصلاة</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/challenges' as any)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="trophy" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>التحديات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/subscription' as any)}
            >
              <View style={styles.quickActionIcon}>
                <Ionicons name="card" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickActionText}>الاشتراك</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Padding */}
        <View style={{ height: 32 }} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  methodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  eventIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: COLORS.text,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
});
