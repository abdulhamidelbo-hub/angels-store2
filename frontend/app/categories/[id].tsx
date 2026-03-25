import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Azkar } from '../../src/types';
import { ListenButton } from '../../src/components/ui';

interface AzkarCardProps {
  item: Azkar;
  index: number;
  onPress: () => void;
  onFavorite: () => void;
  isRTL: boolean;
  currentLanguage: string;
  t: (key: string) => string;
}

const AzkarCard: React.FC<AzkarCardProps> = ({ item, index, onPress, onFavorite, isRTL, currentLanguage, t }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const isPressed = useSharedValue(false);
  const heartScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      index * 80,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      index * 80,
      withSpring(0, { damping: 15, stiffness: 80 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      {
        scale: withSpring(isPressed.value ? 0.98 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onFavorite();
  };

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        onPressIn={() => {
          isPressed.value = true;
          Haptics.selectionAsync();
        }}
        onPressOut={() => {
          isPressed.value = false;
        }}
      >
        <View style={styles.azkarCard}>
          {/* Header */}
          <View style={[styles.azkarHeader, isRTL && styles.rowRTL]}>
            <LinearGradient
              colors={THEME.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.repeatBadge}
            >
              <Text style={styles.repeatText}>×{item.repeat_count}</Text>
            </LinearGradient>
            <View style={styles.headerActions}>
              <ListenButton
                text={item.arabic_text}
                language="ar"
                size="small"
                showLabel={false}
              />
              <Pressable style={styles.favoriteButton} onPress={handleFavorite}>
                <Animated.View style={heartStyle}>
                  <Ionicons
                    name={item.is_favorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={item.is_favorite ? '#FF6B6B' : THEME.colors.textMuted}
                  />
                </Animated.View>
              </Pressable>
            </View>
          </View>

          {/* Arabic Text */}
          <Text style={styles.arabicText} numberOfLines={3}>
            {item.arabic_text}
          </Text>

          {/* Transliteration (if available) */}
          {item.transliteration && (
            <View style={styles.transliterationContainer}>
              <Ionicons name="text" size={14} color={THEME.colors.textMuted} />
              <Text style={styles.transliterationText} numberOfLines={2}>
                {item.transliteration}
              </Text>
            </View>
          )}

          {/* Translation (for non-Arabic languages) */}
          {currentLanguage !== 'ar' && item.translation_en && (
            <View style={styles.translationContainer}>
              <View style={[styles.translationHeader, isRTL && styles.rowRTL]}>
                <Ionicons name="language" size={14} color={THEME.colors.primary} />
                <Text style={[styles.translationLabel, isRTL && { marginRight: 6, marginLeft: 0 }]}>
                  {t('azkar.translation')}
                </Text>
              </View>
              <Text style={[styles.translationText, isRTL && styles.textRTL]}>
                {item.translation_en}
              </Text>
            </View>
          )}

          {/* Virtue */}
          {item.virtue_ar && (
            <LinearGradient
              colors={[THEME.colors.primary + '12', THEME.colors.primary + '06']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.virtueContainer}
            >
              <Ionicons name="star" size={16} color={THEME.colors.gold} />
              <Text style={styles.virtueText} numberOfLines={2}>
                {item.virtue_ar}
              </Text>
            </LinearGradient>
          )}

          {/* Footer */}
          <View style={[styles.footer, isRTL && styles.rowRTL]}>
            <Text style={[styles.reference, isRTL && styles.textRTL]}>{item.reference_ar || t('azkar.reference')}</Text>
            <View style={[styles.arrowContainer, isRTL && styles.rowRTL]}>
              <Text style={styles.readMore}>{t('common.next')}</Text>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color={THEME.colors.primary} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function CategoryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const { id } = useLocalSearchParams();
  const [azkar, setAzkar] = useState<Azkar[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState(THEME.colors.primary);

  useEffect(() => {
    loadAzkar();
  }, [id]);

  const loadAzkar = async () => {
    try {
      const data = await apiService.getAzkarByCategory(Number(id));
      setAzkar(data);
      
      const categories = await apiService.getCategories();
      const category = categories.find((c) => c.id === Number(id));
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadAzkar();
    setRefreshing(false);
  };

  const toggleFavorite = async (azkarId: number) => {
    try {
      const result = await apiService.toggleFavorite(azkarId);
      setAzkar((prev) =>
        prev.map((item) =>
          item.id === azkarId
            ? { ...item, is_favorite: result.is_favorite }
            : item
        )
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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
          entering={FadeInDown.springify()}
          style={[styles.headerContent, isRTL && styles.headerContentRTL]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{categoryName}</Text>
            <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>{azkar.length} {t('azkar.title')}</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </Animated.View>
      </LinearGradient>

      {/* List */}
      <FlatList
        data={azkar}
        renderItem={({ item, index }) => (
          <AzkarCard
            item={item}
            index={index}
            onPress={() => router.push(`/azkar/${item.id}`)}
            onFavorite={() => toggleFavorite(item.id!)}
            isRTL={isRTL}
            currentLanguage={currentLanguage?.code || 'ar'}
            t={t}
          />
        )}
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
            <View style={styles.emptyIconContainer}>
              <Ionicons name="book-outline" size={48} color={THEME.colors.textMuted} />
            </View>
            <Text style={[styles.emptyText, isRTL && styles.textRTL]}>{t('azkar.noAzkar')}</Text>
          </View>
        }
      />
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
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.small,
  },
  azkarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  favoriteButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    color: THEME.colors.text,
    textAlign: 'right',
    marginBottom: THEME.spacing.md,
  },
  transliterationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: THEME.colors.background,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  transliterationText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
    marginLeft: THEME.spacing.sm,
    lineHeight: 22,
  },
  translationContainer: {
    backgroundColor: THEME.colors.primary + '08',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: THEME.colors.primary,
  },
  translationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 6,
  },
  translationText: {
    fontSize: 15,
    color: THEME.colors.text,
    lineHeight: 24,
  },
  virtueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  virtueText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.md,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  reference: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMore: {
    fontSize: 13,
    color: THEME.colors.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.colors.textSecondary,
  },
});
