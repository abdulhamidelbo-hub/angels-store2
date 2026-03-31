import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { ListenButton } from '../../src/components/ui';
import { useApp } from '../../src/contexts/AppContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// دالة لجلب نص الفضل حسب اللغة المختارة
const getVirtueByLanguage = (azkar: Azkar | null, languageCode: string): string => {
  if (!azkar) return '';
  
  // جلب الترجمة حسب اللغة مع fallback للعربية
  switch (languageCode) {
    case 'fr':
      return (azkar as any).virtue_fr || azkar.virtue_en || azkar.virtue_ar || '';
    case 'tr':
      return (azkar as any).virtue_tr || azkar.virtue_en || azkar.virtue_ar || '';
    case 'ur':
      return (azkar as any).virtue_ur || azkar.virtue_ar || '';
    case 'id':
      return (azkar as any).virtue_id || azkar.virtue_en || azkar.virtue_ar || '';
    case 'bn':
      return (azkar as any).virtue_bn || azkar.virtue_en || azkar.virtue_ar || '';
    case 'ms':
      return (azkar as any).virtue_ms || azkar.virtue_en || azkar.virtue_ar || '';
    case 'sw':
      return (azkar as any).virtue_sw || azkar.virtue_en || azkar.virtue_ar || '';
    case 'ha':
      return (azkar as any).virtue_ha || azkar.virtue_en || azkar.virtue_ar || '';
    case 'en':
      return azkar.virtue_en || azkar.virtue_ar || '';
    case 'ar':
    default:
      return azkar.virtue_ar || '';
  }
};

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

  // حساب حجم الخط المتجاوب حسب طول النص
  const getResponsiveFontSize = useCallback((baseSize: number, text: string): number => {
    const textLength = text?.length || 0;
    if (textLength > 500) return baseSize - 4;
    if (textLength > 300) return baseSize - 2;
    return baseSize;
  }, []);

  // حساب ارتفاع منطقة الفضل حسب طول النص
  const getVirtueMaxHeight = useCallback((text: string): number => {
    const textLength = text?.length || 0;
    if (textLength > 300) return 140;
    if (textLength > 150) return 110;
    if (textLength > 80) return 90;
    return 70;
  }, []);

  // حساب الهوامش الديناميكية
  const getDynamicPadding = useCallback((text: string): number => {
    const textLength = text?.length || 0;
    if (textLength > 400) return 12;
    if (textLength > 200) return 16;
    return 20;
  }, []);

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
  const dynamicPadding = getDynamicPadding(azkar.arabic_text);
  const arabicFontSize = getResponsiveFontSize(24, azkar.arabic_text);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ========== HEADER - مضغوط مع العداد ========== */}
      <LinearGradient
        colors={THEME.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={[styles.headerContent, isRTL && styles.headerContentRTL]}>
          {/* زر الرجوع */}
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.buttonPressed]}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#FFFFFF" />
          </Pressable>
          
          {/* العنوان وعدد التكرار */}
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t('azkar.detail')}</Text>
            <View style={styles.repeatBadgeHeader}>
              <Text style={styles.repeatBadgeText}>×{azkar.repeat_count}</Text>
            </View>
          </View>
          
          {/* زر المفضلة */}
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

        {/* ========== منطقة العداد المضغوطة ========== */}
        <View style={styles.compactCounter}>
          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{count}</Text>
            <Text style={styles.counterLabel}>{t('azkar.current')}</Text>
          </View>
          
          {/* شريط التقدم */}
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={isCompleted ? THEME.gradients.gold : ['#FFFFFF', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
              />
            </View>
          </View>
          
          <View style={styles.counterItem}>
            <Text style={styles.counterValue}>{azkar.repeat_count}</Text>
            <Text style={styles.counterLabel}>{t('azkar.total')}</Text>
          </View>
          
          <View style={styles.counterDivider} />
          
          <View style={styles.counterItem}>
            <Text style={[styles.counterValue, isCompleted && styles.completedText]}>
              {Math.round(progress)}%
            </Text>
            <Text style={styles.counterLabel}>{t('azkar.progress')}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ========== المحتوى الرئيسي - قابل للتمدد ========== */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* ========== بطاقة النص الأساسي ========== */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()} 
          style={[styles.mainTextCard, { padding: dynamicPadding }]}
        >
          {/* زر الاستماع */}
          <View style={styles.listenButtonRow}>
            <ListenButton
              text={azkar.arabic_text}
              language="ar"
              size="small"
              showLabel={false}
            />
          </View>

          {/* النص العربي - الآن يأخذ كل المساحة المتاحة */}
          <Text 
            style={[
              styles.arabicText, 
              { 
                fontSize: arabicFontSize,
                lineHeight: arabicFontSize * 1.8,
              }
            ]}
          >
            {azkar.arabic_text}
          </Text>
        </Animated.View>

        {/* ========== بطاقة فضل الذكر (مترجمة حسب اللغة) ========== */}
        {azkar.virtue_ar && (
          <Animated.View 
            entering={FadeInDown.delay(150).springify()} 
            style={styles.virtueCard}
          >
            {/* العنوان */}
            <View style={[styles.virtueHeader, isRTL && styles.rowRTL]}>
              <View style={styles.virtueIconBox}>
                <Ionicons name="star" size={18} color={THEME.colors.gold} />
              </View>
              <View style={styles.virtueHeaderText}>
                <Text style={styles.virtueTitle}>{t('azkar.virtue')}</Text>
                <Text style={styles.virtueSubtitle}>{t('azkar.virtueDescription')}</Text>
              </View>
              <ListenButton
                text={getVirtueByLanguage(azkar, currentLanguage?.code || 'ar')}
                language={currentLanguage?.code || 'ar'}
                size="small"
                showLabel={false}
                variant="secondary"
              />
            </View>
            
            {/* نص الفضل - يعرض حسب اللغة المختارة */}
            <ScrollView 
              style={[styles.virtueTextScroll, { maxHeight: getVirtueMaxHeight(azkar.virtue_ar) }]}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {/* عرض نص الفضل حسب اللغة المختارة */}
              {currentLanguage?.code === 'ar' || currentLanguage?.code === 'ur' ? (
                <Text style={[styles.virtueText, styles.textRTL]}>
                  {getVirtueByLanguage(azkar, currentLanguage?.code || 'ar')}
                </Text>
              ) : (
                <Text style={styles.virtueTextLTR}>
                  {getVirtueByLanguage(azkar, currentLanguage?.code || 'ar')}
                </Text>
              )}
            </ScrollView>
          </Animated.View>
        )}

        {/* ملاحظة: تم إزالة قسم الترجمة - النص الديني يبقى عربياً دائماً */}

        {/* ========== بطاقة المرجع - بسيطة ========== */}
        {azkar.reference_ar && (
          <Animated.View 
            entering={FadeInDown.delay(250).springify()} 
            style={styles.referenceCard}
          >
            <View style={[styles.referenceContent, isRTL && styles.rowRTL]}>
              <Ionicons name="book-outline" size={14} color={THEME.colors.textMuted} />
              <Text style={styles.referenceLabel}>{t('azkar.reference')}:</Text>
              <Text style={[styles.referenceText, isRTL && styles.textRTL]}>
                {azkar.reference_ar}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* مساحة إضافية للأزرار الثابتة */}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ========== الأزرار الثابتة في الأسفل ========== */}
      <View style={[styles.fixedBottomButtons, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* شريط التقدم الصغير */}
        <View style={styles.bottomProgressBar}>
          <View style={styles.bottomProgressBg}>
            <LinearGradient
              colors={isCompleted ? THEME.gradients.gold : THEME.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.bottomProgressFill, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <Text style={[styles.bottomProgressText, isCompleted && { color: THEME.colors.gold }]}>
            {count}/{azkar.repeat_count}
          </Text>
        </View>

        {/* صف الأزرار */}
        <View style={[styles.buttonsRow, isRTL && styles.rowRTL]}>
          {/* زر باللمس */}
          <Pressable
            style={({ pressed }) => [styles.touchButton, pressed && styles.buttonPressed]}
            onPress={handleCount}
          >
            <LinearGradient
              colors={isCompleted ? THEME.gradients.gold : THEME.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.touchButtonGradient}
            >
              <Ionicons name="hand-left" size={20} color="#FFF" />
              <Text style={styles.touchButtonText}>{t('azkar.touch')}</Text>
            </LinearGradient>
          </Pressable>

          {/* زر بالصوت */}
          <Pressable
            style={({ pressed }) => [styles.voiceButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/tasbeeh/voice' as any)}
          >
            <View style={styles.voiceButtonInner}>
              <Ionicons name="mic" size={20} color={THEME.colors.gold} />
              <Text style={styles.voiceButtonText}>{t('azkar.voice')}</Text>
            </View>
          </Pressable>

          {/* زر إعادة التعيين */}
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.buttonPressed]}
            onPress={handleReset}
          >
            <Ionicons name="refresh" size={20} color={THEME.colors.textMuted} />
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
  
  // ========== HEADER ==========
  header: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  repeatBadgeHeader: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 3,
  },
  repeatBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  
  // ========== منطقة العداد المضغوطة ==========
  compactCounter: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    marginTop: THEME.spacing.sm,
    alignItems: 'center',
  },
  counterItem: {
    alignItems: 'center',
    minWidth: 45,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  counterLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  progressBarWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  counterDivider: {
    width: 1,
    height: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
  },
  completedText: {
    color: THEME.colors.gold,
  },
  
  // ========== Loading ==========
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
  
  // ========== المحتوى الرئيسي ==========
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.md,
  },
  
  // ========== بطاقة النص الأساسي ==========
  mainTextCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  listenButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: THEME.spacing.sm,
  },
  arabicText: {
    color: THEME.colors.text,
    textAlign: 'center',
    fontFamily: 'System',
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  textRTL: {
    textAlign: 'right',
  },
  
  // ========== بطاقة فضل الذكر ==========
  virtueCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    marginBottom: THEME.spacing.md,
    borderWidth: 0.5,
    borderColor: '#81C784',
  },
  virtueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    gap: 8,
  },
  virtueIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: THEME.colors.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  virtueHeaderText: {
    flex: 1,
  },
  virtueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D5E',
  },
  virtueSubtitle: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 1,
  },
  virtueTextScroll: {
    // maxHeight يتم تحديده ديناميكياً
  },
  virtueText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#166534',
    textAlign: 'right',
  },
  virtueTextLTR: {
    fontSize: 14,
    lineHeight: 24,
    color: '#166534',
    textAlign: 'left',
  },
  virtueTranslationBox: {
    marginTop: THEME.spacing.sm,
    paddingTop: THEME.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  virtueTranslationText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#15803D',
    fontStyle: 'italic',
  },
  
  // ========== بطاقة الترجمة ==========
  translationCard: {
    backgroundColor: THEME.colors.primary + '08',
    borderRadius: 12,
    padding: 12,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  translationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
    textTransform: 'uppercase',
  },
  translationText: {
    fontSize: 14,
    color: THEME.colors.text,
    lineHeight: 22,
  },
  
  // ========== بطاقة المرجع ==========
  referenceCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: THEME.spacing.sm,
  },
  referenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  referenceLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  referenceText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  
  // ========== الأزرار الثابتة ==========
  fixedBottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.sm,
    ...THEME.shadows.large,
  },
  bottomProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    gap: 10,
  },
  bottomProgressBg: {
    flex: 1,
    height: 6,
    backgroundColor: THEME.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  bottomProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bottomProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    minWidth: 40,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  touchButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  touchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  touchButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  voiceButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  voiceButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    backgroundColor: THEME.colors.gold + '15',
    borderWidth: 1,
    borderColor: THEME.colors.gold + '30',
    borderRadius: 12,
  },
  voiceButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.gold,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
});
