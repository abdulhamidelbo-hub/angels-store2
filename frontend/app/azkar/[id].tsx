import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { ListenButton } from '../../src/components/ui';
import { useApp } from '../../src/contexts/AppContext';

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
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const progress = azkar.repeat_count > 0 ? (count / azkar.repeat_count) * 100 : 0;

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
          <Text style={styles.headerTitle}>{t('azkar.detail')}</Text>
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
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Arabic Text Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.mainCard}>
          {/* Repeat Badge */}
          <View style={[styles.repeatRow, isRTL && styles.rowRTL]}>
            <LinearGradient
              colors={THEME.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.repeatBadge}
            >
              <Text style={styles.repeatText}>×{azkar.repeat_count}</Text>
            </LinearGradient>
            <ListenButton
              text={azkar.arabic_text}
              language="ar"
              size="medium"
              showLabel={false}
            />
          </View>

          {/* Arabic Text */}
          <Text style={styles.arabicText}>{azkar.arabic_text}</Text>

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
              <Text style={[styles.translationText, isRTL && styles.textRTL]}>
                {azkar.translation_en}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Counter Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.counterCard}>
          <Text style={styles.counterTitle}>{t('azkar.counter')}</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={THEME.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{count}/{azkar.repeat_count}</Text>
          </View>

          {/* Counter Buttons */}
          <View style={[styles.counterButtons, isRTL && styles.rowRTL]}>
            <Pressable
              style={({ pressed }) => [styles.resetButton, pressed && styles.buttonPressed]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color={THEME.colors.textMuted} />
              <Text style={styles.resetText}>{t('azkar.reset')}</Text>
            </Pressable>
            
            <Pressable
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}
              onPress={handleCount}
            >
              <LinearGradient
                colors={THEME.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.countButton}
              >
                <Text style={styles.countButtonText}>{t('azkar.count')}</Text>
                <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        {/* Virtue Card */}
        {azkar.virtue_ar && (
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.infoCard}>
            <View style={[styles.infoHeader, isRTL && styles.rowRTL]}>
              <View style={[styles.infoIconBox, { backgroundColor: THEME.colors.gold + '20' }]}>
                <Ionicons name="star" size={20} color={THEME.colors.gold} />
              </View>
              <Text style={styles.infoTitle}>{t('azkar.virtue')}</Text>
              <View style={{ flex: 1 }} />
              <ListenButton
                text={azkar.virtue_ar}
                language="ar"
                size="small"
                showLabel={false}
                variant="secondary"
              />
            </View>
            <Text style={[styles.infoText, isRTL && styles.textRTL]}>{azkar.virtue_ar}</Text>
            
            {/* Virtue Translation */}
            {currentLanguage?.code !== 'ar' && azkar.virtue_en && (
              <Text style={[styles.infoTextTranslation, isRTL && styles.textRTL]}>
                {azkar.virtue_en}
              </Text>
            )}
          </Animated.View>
        )}

        {/* Reference Card */}
        {azkar.reference_ar && (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.infoCard}>
            <View style={[styles.infoHeader, isRTL && styles.rowRTL]}>
              <View style={[styles.infoIconBox, { backgroundColor: THEME.colors.primary + '20' }]}>
                <Ionicons name="book" size={20} color={THEME.colors.primary} />
              </View>
              <Text style={styles.infoTitle}>{t('azkar.reference')}</Text>
            </View>
            <Text style={[styles.infoText, isRTL && styles.textRTL]}>{azkar.reference_ar}</Text>
            
            {/* Reference Translation */}
            {currentLanguage?.code !== 'ar' && azkar.reference_en && (
              <Text style={[styles.infoTextTranslation, isRTL && styles.textRTL]}>
                {azkar.reference_en}
              </Text>
            )}
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={[styles.actionsRow, isRTL && styles.rowRTL]}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/voice' as any)}
          >
            <Ionicons name="mic" size={24} color={THEME.colors.gold} />
            <Text style={styles.actionText}>{t('home.voice')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/touch' as any)}
          >
            <Ionicons name="hand-left" size={24} color={THEME.colors.primary} />
            <Text style={styles.actionText}>{t('home.touch')}</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
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
  headerTitle: {
    fontSize: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  mainCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  repeatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  repeatBadge: {
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  repeatText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arabicText: {
    fontSize: 26,
    lineHeight: 48,
    color: THEME.colors.text,
    textAlign: 'right',
    marginBottom: THEME.spacing.md,
  },
  transliterationBox: {
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
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
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  translationText: {
    fontSize: 16,
    color: THEME.colors.text,
    lineHeight: 26,
  },
  textRTL: {
    textAlign: 'right',
  },
  counterCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressContainer: {
    marginBottom: THEME.spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: THEME.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  counterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resetText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
  },
  countButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: THEME.borderRadius.md,
  },
  countButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 28,
    color: THEME.colors.text,
    textAlign: 'right',
  },
  infoTextTranslation: {
    fontSize: 14,
    lineHeight: 24,
    color: THEME.colors.textSecondary,
    marginTop: THEME.spacing.sm,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadows.small,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
    marginTop: 8,
  },
});
