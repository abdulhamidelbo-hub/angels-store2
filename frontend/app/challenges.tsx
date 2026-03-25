import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/colors';
import { apiService } from '../src/services/api';
import { Challenge } from '../src/types';
import { useApp } from '../src/contexts/AppContext';

export default function ChallengesScreen() {
  const router = useRouter();
  const { todayStats } = useApp();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const data = await apiService.getChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (challenge: Challenge) => {
    if (!todayStats) return 0;
    
    // Calculate based on challenge type
    if (challenge.title_ar.includes('تسبيح')) {
      return Math.min((todayStats.total_tasbeeh / challenge.required_count) * 100, 100);
    }
    if (challenge.title_ar.includes('ذكر')) {
      return Math.min((todayStats.completed_azkar_count / challenge.required_count) * 100, 100);
    }
    return 0;
  };

  const renderChallenge = (challenge: Challenge) => {
    const progress = getProgress(challenge);
    const isCompleted = progress >= 100;

    return (
      <View key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={[
            styles.challengeIcon,
            isCompleted && styles.challengeIconCompleted
          ]}>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'trophy'}
              size={32}
              color={isCompleted ? COLORS.success : COLORS.primary}
            />
          </View>
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rewardText}>{challenge.reward_xp} XP</Text>
          </View>
        </View>

        <Text style={styles.challengeTitle}>{challenge.title_ar}</Text>
        <Text style={styles.challengeDescription}>{challenge.description_ar}</Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                isCompleted && styles.progressFillCompleted,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress)}%
          </Text>
        </View>

        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.completedText}>تم الإنجاز! بارك الله فيك</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>التحديات والإنجازات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayStats?.xp_earned || 0}</Text>
            <Text style={styles.statLabel}>XP اليوم</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenges.filter(c => getProgress(c) >= 100).length}</Text>
            <Text style={styles.statLabel}>تحديات منجزة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenges.length}</Text>
            <Text style={styles.statLabel}>إجمالي</Text>
          </View>
        </View>

        {/* Daily Challenges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تحديات اليوم</Text>
          {challenges.map(renderChallenge)}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.infoText}>
            أكمل التحديات لتجمع نقاط XP وترتقي في المستويات!
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  content: {
    padding: 20,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeIconCompleted: {
    backgroundColor: COLORS.success + '20',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '20',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B7500',
    marginLeft: 4,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  progressFillCompleted: {
    backgroundColor: COLORS.success,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '10',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  completedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700' + '10',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 12,
    lineHeight: 20,
  },
});