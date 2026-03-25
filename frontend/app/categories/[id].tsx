import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { ListenButton } from '../../src/components/ui';
import { useApp } from '../../src/contexts/AppContext';

// Constants
const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
const PROGRESS_STORAGE_KEY = '@azkar_progress';

interface AzkarProgress {
  azkarId: number;
  count: number;
  isCompleted: boolean;
  completedAt: number | null;
}

// ============================================================
// AZKAR CARD COMPONENT
// ============================================================
interface AzkarCardProps {
  item: Azkar;
  index: number;
  progress: AzkarProgress | null;
  onTouchCount: () => void;
  onVoiceCount: () => void;
  isListening: boolean;
  isCurrentListening: boolean;
  isRTL: boolean;
  currentLanguage: string;
  t: (key: string) => string;
  getRemainingTime: (completedAt: number) => string;
}

const AzkarCard: React.FC<AzkarCardProps> = ({
  item,
  index,
  progress,
  onTouchCount,
  onVoiceCount,
  isListening,
  isCurrentListening,
  isRTL,
  currentLanguage,
  t,
  getRemainingTime,
}) => {
  const router = useRouter();
  const isPressed = useSharedValue(false);
  const pulseValue = useSharedValue(1);

  const currentCount = progress?.count || 0;
  const isCompleted = progress?.isCompleted || false;
  const completedAt = progress?.completedAt || null;
  const progressPercent = item.repeat_count > 0 ? (currentCount / item.repeat_count) * 100 : 0;

  // Pulse animation for listening state
  useEffect(() => {
    if (isCurrentListening) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      pulseValue.value = withTiming(1, { duration: 200 });
    }
  }, [isCurrentListening]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isPressed.value ? withSpring(0.98) : withSpring(1) },
    ],
    opacity: withTiming(1, { duration: 300 }),
  }));

  const listeningStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  // Card background color based on completion status
  const getCardBackground = () => {
    if (isCompleted) {
      return ['#FFD700', '#FFA500']; // Gold gradient for completed
    }
    return [THEME.colors.surface, THEME.colors.surface];
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    router.push(`/azkar/${item.id}` as any);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={containerStyle}
    >
      <View style={[
        styles.azkarCard,
        isCompleted && styles.completedCard,
        isCurrentListening && styles.listeningCard,
        { backgroundColor: isCompleted ? '#FFD70030' : THEME.colors.surface }
      ]}>
        {/* Header with repeat count and actions */}
        <View style={[styles.cardHeader, isRTL && styles.rowRTL]}>
          {/* Repeat Badge */}
            <LinearGradient
              colors={isCompleted ? ['#FFF', '#FFF'] : THEME.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.repeatBadge}
            >
              <Text style={[styles.repeatText, isCompleted && { color: '#FFD700' }]}>
                ×{item.repeat_count}
              </Text>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={[styles.actionButtons, isRTL && styles.rowRTL]}>
              {/* Listen Button */}
              <ListenButton
                text={item.arabic_text}
                language="ar"
                size="small"
                showLabel={false}
              />

              {/* Favorite Button */}
              <Pressable
                style={styles.iconButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  // Toggle favorite
                }}
              >
                <Ionicons
                  name={item.is_favorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={item.is_favorite ? '#FF6B6B' : THEME.colors.textMuted}
                />
              </Pressable>
            </View>
          </View>

          {/* Arabic Text */}
          <Text style={[styles.arabicText, isCompleted && styles.completedText]} numberOfLines={3}>
            {item.arabic_text}
          </Text>

          {/* Transliteration */}
          {item.transliteration && (
            <Text style={[styles.transliterationText, isCompleted && { color: '#333' }]} numberOfLines={2}>
              {item.transliteration}
            </Text>
          )}

          {/* Progress Section */}
          <View style={styles.progressSection}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <LinearGradient
                  colors={isCompleted ? ['#FFD700', '#FFD700'] : THEME.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${Math.min(progressPercent, 100)}%` }]}
                />
              </View>
              <Text style={[styles.progressText, isCompleted && { color: '#333' }]}>
                {currentCount}/{item.repeat_count}
              </Text>
            </View>

            {/* Completion Timer */}
            {isCompleted && completedAt && (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color="#333" />
                <Text style={styles.timerText}>
                  {t('azkar.resetsIn')}: {getRemainingTime(completedAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Action Row */}
          <View style={[styles.actionRow, isRTL && styles.rowRTL]}>
            {/* Touch Count Button */}
            <Pressable
              style={({ pressed }) => [
                styles.countButton,
                pressed && styles.countButtonPressed,
                isCompleted && styles.disabledButton,
              ]}
              onPress={onTouchCount}
              disabled={isCompleted}
            >
              <LinearGradient
                colors={isCompleted ? ['#CCC', '#CCC'] : THEME.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countButtonGradient}
              >
                <Ionicons name="add-circle" size={20} color="#FFF" />
                <Text style={styles.countButtonText}>{t('azkar.touch')}</Text>
              </LinearGradient>
            </Pressable>

            {/* Voice Count Button */}
            <Animated.View style={isCurrentListening ? listeningStyle : {}}>
              <Pressable
                style={({ pressed }) => [
                  styles.voiceButton,
                  pressed && styles.voiceButtonPressed,
                  isCurrentListening && styles.voiceButtonActive,
                  isCompleted && styles.disabledButton,
                ]}
                onPress={onVoiceCount}
                disabled={isCompleted}
              >
                <View style={[
                  styles.voiceButtonInner,
                  isCurrentListening && styles.voiceButtonInnerActive,
                ]}>
                  <Ionicons
                    name={isCurrentListening ? 'stop-circle' : 'mic'}
                    size={20}
                    color={isCurrentListening ? '#FF4444' : THEME.colors.gold}
                  />
                  <Text style={[
                    styles.voiceButtonText,
                    isCurrentListening && styles.voiceButtonTextActive,
                  ]}>
                    {isCurrentListening ? t('azkar.stop') : t('azkar.voice')}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          </View>

          {/* Listening Indicator */}
          {isCurrentListening && (
            <View style={styles.listeningIndicator}>
              <Animated.View style={[styles.listeningDot, listeningStyle]} />
              <Animated.View style={[styles.listeningDot, listeningStyle, { animationDelay: '0.2s' }]} />
              <Animated.View style={[styles.listeningDot, listeningStyle, { animationDelay: '0.4s' }]} />
              <Text style={styles.listeningText}>{t('azkar.listening')}</Text>
            </View>
          )}

          {/* Completed Badge */}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.completedBadgeText}>{t('azkar.completed')}</Text>
            </View>
          )}

          {/* View Details Button */}
          <Pressable
            style={({ pressed }) => [
              styles.viewDetailsButton,
              pressed && styles.viewDetailsButtonPressed,
            ]}
            onPress={handlePress}
          >
            <Text style={styles.viewDetailsText}>{t('common.next')}</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={THEME.colors.primary} />
          </Pressable>
        </View>
    </Animated.View>
  );
};

// ============================================================
// MAIN SCREEN COMPONENT
// ============================================================
export default function CategoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const { id } = useLocalSearchParams();
  const { refreshStats } = useApp();
  const flatListRef = useRef<FlatList>(null);

  const [azkar, setAzkar] = useState<Azkar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(THEME.colors.primary);

  // Progress tracking
  const [progressMap, setProgressMap] = useState<Map<number, AzkarProgress>>(new Map());

  // Voice listening state
  const [isListening, setIsListening] = useState(false);
  const [currentListeningId, setCurrentListeningId] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load progress from storage
  useEffect(() => {
    loadProgress();
  }, [id]);

  // Check for reset timers
  useEffect(() => {
    const checkResetTimers = () => {
      const now = Date.now();
      let hasChanges = false;

      progressMap.forEach((progress, azkarId) => {
        if (progress.isCompleted && progress.completedAt) {
          const elapsed = now - progress.completedAt;
          if (elapsed >= RESET_INTERVAL) {
            // Reset this azkar
            progressMap.set(azkarId, {
              ...progress,
              count: 0,
              isCompleted: false,
              completedAt: null,
            });
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setProgressMap(new Map(progressMap));
        saveProgress(progressMap);
      }
    };

    const interval = setInterval(checkResetTimers, 1000);
    return () => clearInterval(interval);
  }, [progressMap]);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(`${PROGRESS_STORAGE_KEY}_${id}`);
      if (stored) {
        const data: AzkarProgress[] = JSON.parse(stored);
        const map = new Map<number, AzkarProgress>();
        data.forEach(p => map.set(p.azkarId, p));
        setProgressMap(map);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (map: Map<number, AzkarProgress>) => {
    try {
      const data = Array.from(map.values());
      await AsyncStorage.setItem(`${PROGRESS_STORAGE_KEY}_${id}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const getRemainingTime = useCallback((completedAt: number): string => {
    const now = Date.now();
    const resetTime = completedAt + RESET_INTERVAL;
    const diffMs = resetTime - now;

    if (diffMs <= 0) return '00:00';

    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    loadAzkar();
  }, [id]);

  const loadAzkar = async () => {
    try {
      const [azkarData, categories] = await Promise.all([
        apiService.getAzkarByCategory(Number(id)),
        apiService.getCategories(),
      ]);
      setAzkar(azkarData);

      const category = categories.find((c: any) => c.id === Number(id));
      if (category) {
        setCategoryName(category.name_ar);
        setCategoryColor(`#${category.color_hex}`);
      }
    } catch (error) {
      console.error('Error loading azkar:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAzkar();
    setRefreshing(false);
  };

  const handleTouchCount = async (azkarId: number, repeatCount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const currentProgress = progressMap.get(azkarId) || {
      azkarId,
      count: 0,
      isCompleted: false,
      completedAt: null,
    };

    if (currentProgress.isCompleted) return;

    const newCount = currentProgress.count + 1;
    const isNowCompleted = newCount >= repeatCount;

    const updatedProgress: AzkarProgress = {
      ...currentProgress,
      count: newCount,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? Date.now() : null,
    };

    const newMap = new Map(progressMap);
    newMap.set(azkarId, updatedProgress);
    setProgressMap(newMap);
    saveProgress(newMap);

    // Record to backend
    try {
      await apiService.recordTasbeeh({
        method: 'touch',
        count: 1,
        zikr_id: azkarId,
      });
      await refreshStats();
    } catch (error) {
      console.error('Error recording tasbeeh:', error);
    }

    // If completed, auto-scroll to next azkar
    if (isNowCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      autoScrollToNextAzkar(azkarId);
    }
  };

  const handleVoiceCount = (azkarId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentListeningId === azkarId) {
      // Stop listening
      setIsListening(false);
      setCurrentListeningId(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      // Start listening for this azkar
      setIsListening(true);
      setCurrentListeningId(azkarId);

      // Simulate voice recognition counting every 3 seconds
      // In production, replace with expo-speech-recognition
      timerRef.current = setInterval(() => {
        setProgressMap(prev => {
          const progress = prev.get(azkarId);
          const azkarItem = azkar.find(a => a.id === azkarId);
          if (!progress || !azkarItem) return prev;

          const newCount = progress.count + 1;
          const isNowCompleted = newCount >= azkarItem.repeat_count;

          if (isNowCompleted) {
            // Stop listening when completed
            setIsListening(false);
            setCurrentListeningId(null);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            autoScrollToNextAzkar(azkarId);
          } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          const newMap = new Map(prev);
          newMap.set(azkarId, {
            ...progress,
            count: newCount,
            isCompleted: isNowCompleted,
            completedAt: isNowCompleted ? Date.now() : null,
          });
          saveProgress(newMap);
          return newMap;
        });
      }, 2000); // Simulate voice detection every 2 seconds
    }
  };

  const autoScrollToNextAzkar = (currentAzkarId: number) => {
    const currentIndex = azkar.findIndex(a => a.id === currentAzkarId);
    if (currentIndex !== -1 && currentIndex < azkar.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextAzkar = azkar[nextIndex];

      // Check if next azkar is not completed
      const nextProgress = progressMap.get(nextAzkar.id!);
      if (!nextProgress?.isCompleted) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
            viewPosition: 0.3,
          });

          // If voice listening was active, continue with next azkar
          if (isListening) {
            handleVoiceCount(nextAzkar.id!);
          }
        }, 500);
      }
    }
  };

  const renderAzkar = ({ item, index }: { item: Azkar; index: number }) => (
    <AzkarCard
      item={item}
      index={index}
      progress={progressMap.get(item.id!) || null}
      onTouchCount={() => handleTouchCount(item.id!, item.repeat_count)}
      onVoiceCount={() => handleVoiceCount(item.id!)}
      isListening={isListening}
      isCurrentListening={currentListeningId === item.id}
      isRTL={isRTL}
      currentLanguage={currentLanguage?.code || 'ar'}
      t={t}
      getRemainingTime={getRemainingTime}
    />
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={THEME.gradients.header}
          style={[styles.header, { paddingTop: insets.top + 8 }]}
        >
          <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
            <Pressable style={styles.headerButton} onPress={() => router.back()}>
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{t('common.loading')}</Text>
            <View style={styles.headerPlaceholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  // Calculate total progress
  const totalCount = Array.from(progressMap.values()).reduce((sum, p) => sum + p.count, 0);
  const completedCount = Array.from(progressMap.values()).filter(p => p.isCompleted).length;

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
        <Animated.View
          entering={FadeIn}
          style={[styles.headerContent, isRTL && styles.headerContentRTL]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              // Stop listening when leaving
              if (isListening && timerRef.current) {
                clearInterval(timerRef.current);
              }
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{categoryName}</Text>
            <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>
              {azkar.length} {t('azkar.title')} • {completedCount}/{azkar.length} {t('azkar.completed')}
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        {/* Daily Stats */}
        <View style={[styles.statsRow, isRTL && styles.rowRTL]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>{t('stats.todayTasbeeh')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completedCount}</Text>
            <Text style={styles.statLabel}>{t('stats.completedAzkar')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* List */}
      <FlatList
        ref={flatListRef}
        data={azkar}
        renderItem={renderAzkar}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={THEME.colors.textMuted} />
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('azkar.noAzkar')}</Text>
          </View>
        }
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 500);
        }}
      />

      {/* Floating Voice Button (when listening) */}
      {isListening && (
        <Animated.View
          entering={FadeIn}
          style={styles.floatingVoiceButton}
        >
          <Pressable
            onPress={() => {
              setIsListening(false);
              setCurrentListeningId(null);
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
            }}
          >
            <LinearGradient
              colors={['#FF4444', '#CC0000']}
              style={styles.floatingButtonGradient}
            >
              <Ionicons name="stop-circle" size={32} color="#FFF" />
              <Text style={styles.floatingButtonText}>{t('azkar.stopListening')}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      )}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContentRTL: {
    flexDirection: 'row-reverse',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  textRTL: {
    textAlign: 'right',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: THEME.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: THEME.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  listContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  azkarCard: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  listeningCard: {
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  repeatBadge: {
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  repeatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 40,
    color: THEME.colors.text,
    textAlign: 'right',
    marginBottom: THEME.spacing.sm,
  },
  completedText: {
    color: '#333',
  },
  transliterationText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginBottom: THEME.spacing.md,
  },
  progressSection: {
    marginBottom: THEME.spacing.md,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    minWidth: 50,
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.sm,
    gap: 6,
  },
  timerText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  countButton: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  countButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  countButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  countButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  voiceButton: {
    flex: 1,
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
  },
  voiceButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  voiceButtonActive: {
    borderWidth: 2,
    borderColor: '#FF4444',
  },
  voiceButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: THEME.colors.gold + '20',
    borderRadius: THEME.borderRadius.md,
  },
  voiceButtonInnerActive: {
    backgroundColor: '#FF444420',
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.gold,
  },
  voiceButtonTextActive: {
    color: '#FF4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.spacing.sm,
    gap: 6,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  listeningText: {
    fontSize: 13,
    color: '#FF4444',
    fontWeight: '500',
    marginLeft: 8,
  },
  completedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.md,
  },
  floatingVoiceButton: {
    position: 'absolute',
    bottom: 30,
    left: THEME.spacing.md,
    right: THEME.spacing.md,
  },
  floatingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: THEME.borderRadius.lg,
    gap: 12,
    ...THEME.shadows.large,
  },
  floatingButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    gap: 6,
  },
  viewDetailsButtonPressed: {
    opacity: 0.7,
    backgroundColor: THEME.colors.primary + '10',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
});
