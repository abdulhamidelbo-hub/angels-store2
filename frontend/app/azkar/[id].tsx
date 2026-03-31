import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { ListenButton } from '../../src/components/ui';
import { useApp } from '../../src/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AzkarDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const { id } = useLocalSearchParams();
  const { refreshStats } = useApp();
  const [azkar, setAzkar] = useState<Azkar | null>(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadAzkar();
  }, [id]);

  const loadAzkar = async () => {
    try {
      const data = await apiService.getAzkarDetail(Number(id));
      setAzkar(data);
    } catch (error) {
      console.error('Error loading azkar:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!azkar || !azkar.id) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await apiService.toggleFavorite(azkar.id);
      setAzkar({ ...azkar, is_favorite: result.is_favorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleCount = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCount = count + 1;
    setCount(newCount);

    if (azkar && newCount >= azkar.repeat_count) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await apiService.recordTasbeeh({
        method: 'touch',
        count: azkar.repeat_count,
        zikr_id: azkar.id,
      });
      await refreshStats();
      setCount(0);
    }
  };

  const handleReset = () => {
    Haptics.selectionAsync();
    setCount(0);
  };

  if (loading || !azkar) {
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
          <Ionicons name="hourglass" size={48} color={THEME.colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const progress = azkar.repeat_count > 0 ? (count / azkar.repeat_count) * 100 : 0;
  const isCompleted = count >= azkar.repeat_count;

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
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.buttonPressed]}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#FFFFFF" />
          </Pressable>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('azkar.detail')}</Text>
            <View style={styles.repeatBadgeHeader}>
              <Text style={styles.repeatBadgeText}>×{azkar.repeat_count}</Text>
            </View>
          </View>
          
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.buttonPressed]}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={azkar.is_favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={azkar.is_favorite ? '#FF6B6B' : '#FFFFFF'}
            />
          </Pressable>
        </View>

        {/* Stats Row in Header */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{count}</Text>
            <Text style={styles.statLabel}>{t('azkar.current')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{azkar.repeat_count}</Text>
            <Text style={styles.statLabel}>{t('azkar.total')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, isCompleted && styles.completedText]}>
              {Math.round(progress)}%
            </Text>
            <Text style={styles.statLabel}>{t('azkar.progress')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content - Scrollable */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 } // Space for bottom buttons
        ]}
      >
        {/* Arabic Text Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.mainCard}>
          {/* Listen Button Row */}
          <View style={[styles.listenRow, isRTL && styles.rowRTL]}>
            <ListenButton
              text={azkar.arabic_text}
              language="ar"
              size="medium"
              showLabel={true}
            />
          </View>

          {/* Arabic Text - Scrollable if needed */}
          <ScrollView 
            style={styles.arabicTextScroll}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.arabicText}>{azkar.arabic_text}</Text>
          </ScrollView>

          {/* Transliteration */}
          {azkar.transliteration && (
            <View style={styles.transliterationBox}>
              <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
                <Ionicons name="text" size={16} color={THEME.colors.textMuted} />
                <Text style={styles.sectionLabel}>{t('azkar.transliteration')}</Text>
              </View>
              <Text style={styles.transliterationText}>{azkar.transliteration}</Text>
            </View>
          )}

          {/* Translation (for non-Arabic) */}
          {currentLanguage?.code !== 'ar' && azkar.translation_en && (
            <View style={styles.translationBox}>
              <View style={[styles.sectionHeader, isRTL && styles.rowRTL]}>
                <Ionicons name="language" size={16} color={THEME.colors.primary} />
                <Text style={[styles.sectionLabel, { color: THEME.colors.primary }]}>
                  {t('azkar.translation')}
                </Text>
                <View style={{ flex: 1 }} />
                <ListenButton
                  text={azkar.translation_en}
                  language={currentLanguage?.code || 'en'}
                  size="small"
                  showLabel={false}
                />
              </View>
              <ScrollView 
                style={styles.translationScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.translationText}>
                  {azkar.translation_en}
                </Text>
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Virtue Card - Enhanced */}
        {azkar.virtue_ar && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.virtueCard}>
            <View style={[styles.virtueHeader, isRTL && styles.rowRTL]}>
              <View style={styles.virtueIconBox}>
                <Ionicons name="star" size={22} color={THEME.colors.gold} />
              </View>
              <View style={styles.virtueHeaderText}>
                <Text style={styles.virtueTitle}>{t('azkar.virtue')}</Text>
                <Text style={styles.virtueSubtitle}>{t('azkar.virtueDescription')}</Text>
              </View>
              <ListenButton
                text={azkar.virtue_ar}
                language="ar"
                size="small"
                showLabel={false}
                variant="secondary"
              />
            </View>
            
            <ScrollView 
              style={styles.virtueTextScroll}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.virtueText, isRTL && styles.textRTL]}>
                {azkar.virtue_ar}
              </Text>
              
              {/* Virtue Translation */}
              {currentLanguage?.code !== 'ar' && azkar.virtue_en && (
                <View style={styles.virtueTranslationBox}>
                  <Text style={styles.virtueTranslationText}>
                    {azkar.virtue_en}
                  </Text>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        )}

        {/* Reference Card */}
        {azkar.reference_ar && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.referenceCard}>
            <View style={[styles.referenceContent, isRTL && styles.rowRTL]}>
              <View style={styles.referenceIconBox}>
                <Ionicons name="book" size={18} color={THEME.colors.primary} />
              </View>
              <View style={styles.referenceTextBox}>
                <Text style={styles.referenceLabel}>{t('azkar.reference')}</Text>
                <Text style={[styles.referenceText, isRTL && styles.textRTL]}>
                  {azkar.reference_ar}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Fixed Bottom Section */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 16 }]}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={isCompleted ? THEME.gradients.gold : THEME.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>
          <Text style={[styles.progressText, isCompleted && styles.completedText]}>
            {count}/{azkar.repeat_count}
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View style={[styles.buttonsRow, isRTL && styles.rowRTL]}>
          {/* Reset Button */}
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.buttonPressed]}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={22} color={THEME.colors.textMuted} />
          </Pressable>

          {/* Main Count Button */}
          <Pressable
            style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}
            onPress={handleCount}
          >
            <LinearGradient
              colors={isCompleted ? THEME.gradients.gold : THEME.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainCountButton}
            >
              <Text style={styles.mainCountButtonText}>{t('azkar.count')}</Text>
              <Ionicons name="add-circle" size={26} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>

          {/* Voice Button */}
          <Pressable
            style={({ pressed }) => [styles.voiceButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/voice' as any)}
          >
            <Ionicons name="mic" size={22} color={THEME.colors.gold} />
          </Pressable>
        </View>

        {/* Secondary Actions */}
        <View style={[styles.secondaryActions, isRTL && styles.rowRTL]}>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/voice' as any)}
          >
            <Ionicons name="mic-outline" size={20} color={THEME.colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>{t('home.voice')}</Text>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/touch' as any)}
          >
            <Ionicons name="hand-left-outline" size={20} color={THEME.colors.textSecondary} />
            <Text style={styles.secondaryButtonText}>{t('home.touch')}</Text>
          </Pressable>
        </View>
      </View>
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
    paddingBottom: THEME.spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  repeatBadgeHeader: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  repeatBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 12,
    marginTop: THEME.spacing.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  completedText: {
    color: THEME.colors.gold,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  
  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
  },
  
  // Main Card
  mainCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  listenRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: THEME.spacing.sm,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  arabicTextScroll: {
    maxHeight: 250,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 44,
    color: THEME.colors.text,
    textAlign: 'right',
    fontFamily: 'System',
  },
  transliterationBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    padding: THEME.spacing.md,
    marginTop: THEME.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
  },
  transliterationText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 26,
  },
  translationBox: {
    backgroundColor: THEME.colors.primary + '08',
    borderRadius: 12,
    padding: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
    marginTop: THEME.spacing.md,
  },
  translationScroll: {
    maxHeight: 150,
  },
  translationText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
  },
  textRTL: {
    textAlign: 'right',
  },
  
  // Virtue Card - Enhanced
  virtueCard: {
    backgroundColor: '#F0FDF4', // Light green background
    borderRadius: 20,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0', // Green border
    ...THEME.shadows.small,
  },
  virtueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: 12,
  },
  virtueIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: THEME.colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  virtueHeaderText: {
    flex: 1,
  },
  virtueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534', // Dark green
  },
  virtueSubtitle: {
    fontSize: 12,
    color: '#15803D', // Medium green
    marginTop: 2,
  },
  virtueTextScroll: {
    maxHeight: 150,
  },
  virtueText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#166534',
    textAlign: 'right',
  },
  virtueTranslationBox: {
    marginTop: THEME.spacing.sm,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  virtueTranslationText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#15803D',
    fontStyle: 'italic',
  },
  
  // Reference Card
  referenceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  referenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  referenceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenceTextBox: {
    flex: 1,
  },
  referenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  referenceText: {
    fontSize: 14,
    color: THEME.colors.text,
  },
  
  // Bottom Section - Fixed
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    ...THEME.shadows.large,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressBar: {
    height: 10,
    backgroundColor: THEME.colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Buttons Row
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
  },
  resetButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  mainCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: SCREEN_WIDTH * 0.5,
    justifyContent: 'center',
  },
  mainCountButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.gold + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.gold + '30',
  },
  
  // Secondary Actions
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.lg,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
});
