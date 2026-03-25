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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../../src/constants/theme';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { apiService } from '../../src/services/api';
import { Category } from '../../src/types';
import { CategoryCard } from '../../src/components/ui';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Animation values
  const headerOpacity = useSharedValue(0);

  useEffect(() => {
    loadCategories();
    headerOpacity.value = withTiming(1, { duration: 500 });
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadCategories();
    setRefreshing(false);
  };

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const getIconName = (categoryId: number): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<number, keyof typeof Ionicons.glyphMap> = {
      1: 'sunny',
      2: 'moon',
      3: 'book',
      4: 'bed',
      5: 'sunny-outline',
      6: 'restaurant',
      7: 'home',
      8: 'water',
      9: 'hand-left',
      10: 'megaphone',
      11: 'business',
      12: 'repeat',
      13: 'heart',
      14: 'shield-checkmark',
    };
    return iconMap[categoryId] || 'book';
  };

  const toggleViewMode = () => {
    Haptics.selectionAsync();
    setViewMode((prev) => (prev === 'list' ? 'grid' : 'list'));
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => (
    <CategoryCard
      id={item.id}
      nameAr={item.name_ar}
      nameEn={item.name_en}
      icon={getIconName(item.id)}
      color={`#${item.color_hex}`}
      count={item.azkar_count}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/categories/${item.id}`);
      }}
      delay={index * 60}
      variant={viewMode}
      isRTL={isRTL}
      currentLanguage={currentLanguage?.code || 'ar'}
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
          <Text style={styles.headerTitle}>{t('categories.title')}</Text>
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
      
      {/* Gradient Header */}
      <LinearGradient
        colors={THEME.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Animated.View style={[styles.headerContent, headerStyle, isRTL && styles.headerContentRTL]}>
          <View>
            <Text style={[styles.headerTitle, isRTL && styles.textRTL]}>{t('categories.title')}</Text>
            <Text style={[styles.headerSubtitle, isRTL && styles.textRTL]}>{categories.length} {t('categories.available')}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.viewModeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={toggleViewMode}
          >
            <Ionicons
              name={viewMode === 'list' ? 'grid' : 'list'}
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </Animated.View>
      </LinearGradient>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={[
          styles.listContent,
          viewMode === 'grid' && styles.gridContent,
        ]}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
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
  textRTL: {
    textAlign: 'right',
  },
  viewModeButton: {
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
  gridContent: {
    paddingHorizontal: THEME.spacing.md,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
});
