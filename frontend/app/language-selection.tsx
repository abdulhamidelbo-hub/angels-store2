import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { THEME } from '../src/constants/theme';
import { LANGUAGES, POPULAR_LANGUAGES, Language } from '../src/i18n/languages';
import { useLanguage } from '../src/contexts/LanguageContext';

interface LanguageCardProps {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
  index: number;
}

const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  isSelected,
  onPress,
  index,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.languageCardContainer}
    >
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
        style={({ pressed }) => [
          styles.languageCard,
          isSelected && styles.languageCardSelected,
          pressed && styles.languageCardPressed,
        ]}
      >
        <Text style={styles.flag}>{language.flag}</Text>
        <View style={styles.languageInfo}>
          <Text style={[styles.languageName, isSelected && styles.languageNameSelected]}>
            {language.nameNative}
          </Text>
          <Text style={styles.languageNameEn}>{language.nameEn}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={THEME.colors.primary} />
          </View>
        )}
        {language.isRTL && (
          <View style={styles.rtlBadge}>
            <Text style={styles.rtlBadgeText}>RTL</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { currentLanguage, changeAppLanguage, needsRestart, setNeedsRestart } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState(currentLanguage?.code || 'ar');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) {
      return LANGUAGES;
    }
    const query = searchQuery.toLowerCase();
    return LANGUAGES.filter(
      (lang) =>
        lang.nameNative.toLowerCase().includes(query) ||
        lang.nameEn.toLowerCase().includes(query) ||
        lang.nameAr.includes(query) ||
        lang.code.includes(query)
    );
  }, [searchQuery]);

  const popularLanguages = useMemo(() => {
    return LANGUAGES.filter((lang) => POPULAR_LANGUAGES.includes(lang.code));
  }, []);

  const handleSelectLanguage = (code: string) => {
    setSelectedCode(code);
  };

  const handleConfirm = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await changeAppLanguage(selectedCode);
    
    if (needsRestart) {
      Alert.alert(
        'Restart Required',
        'Please restart the app for the language change to take full effect.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      router.back();
    }
  };

  const renderLanguageItem = ({ item, index }: { item: Language; index: number }) => (
    <LanguageCard
      language={item}
      isSelected={selectedCode === item.code}
      onPress={() => handleSelectLanguage(item.code)}
      index={index}
    />
  );

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
        <Animated.View entering={FadeIn.springify()} style={styles.headerContent}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>اختر لغتك</Text>
            <Text style={styles.headerSubtitle}>Select Your Language</Text>
          </View>
          <View style={styles.placeholder} />
        </Animated.View>
      </LinearGradient>

      {/* Search Bar */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.searchContainer}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={THEME.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="بحث عن لغة... / Search for a language..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={THEME.colors.textMuted} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Popular Languages Section */}
      {!searchQuery && (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>
            🌟 اللغات الشائعة / Popular Languages
          </Text>
          <View style={styles.popularGrid}>
            {popularLanguages.map((lang, index) => (
              <Pressable
                key={lang.code}
                onPress={() => {
                  Haptics.selectionAsync();
                  handleSelectLanguage(lang.code);
                }}
                style={({ pressed }) => [
                  styles.popularCard,
                  selectedCode === lang.code && styles.popularCardSelected,
                  pressed && styles.popularCardPressed,
                ]}
              >
                <Text style={styles.popularFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.popularName,
                    selectedCode === lang.code && styles.popularNameSelected,
                  ]}
                  numberOfLines={1}
                >
                  {lang.nameNative}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* All Languages List */}
      <Animated.View
        entering={FadeInDown.delay(300).springify()}
        style={styles.listSection}
      >
        <Text style={styles.sectionTitle}>
          🌍 {searchQuery ? 'نتائج البحث / Search Results' : 'جميع اللغات / All Languages'}
        </Text>
        <FlatList
          data={filteredLanguages}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyText}>لا توجد نتائج / No results found</Text>
            </View>
          }
        />
      </Animated.View>

      {/* Confirm Button */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={[styles.confirmContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Pressable
          onPress={handleConfirm}
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.confirmButtonPressed,
          ]}
        >
          <LinearGradient
            colors={THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmGradient}
          >
            <Text style={styles.confirmText}>تأكيد / Confirm</Text>
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  searchContainer: {
    padding: THEME.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    paddingHorizontal: THEME.spacing.md,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
    textAlign: 'left',
  },
  section: {
    paddingHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  popularCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.border,
  },
  popularCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary + '10',
  },
  popularCardPressed: {
    opacity: 0.7,
  },
  popularFlag: {
    fontSize: 20,
    marginRight: THEME.spacing.sm,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  popularNameSelected: {
    color: THEME.colors.primary,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
  },
  listContent: {
    paddingBottom: THEME.spacing.xl,
  },
  languageCardContainer: {
    marginBottom: THEME.spacing.sm,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary + '08',
  },
  languageCardPressed: {
    opacity: 0.8,
  },
  flag: {
    fontSize: 32,
    marginRight: THEME.spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: THEME.colors.primary,
  },
  languageNameEn: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
  checkmark: {
    marginLeft: THEME.spacing.sm,
  },
  rtlBadge: {
    backgroundColor: THEME.colors.gold + '30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: THEME.spacing.sm,
  },
  rtlBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.gold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: THEME.colors.textMuted,
    marginTop: THEME.spacing.md,
  },
  confirmContainer: {
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background,
  },
  confirmButton: {
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
  },
  confirmButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
