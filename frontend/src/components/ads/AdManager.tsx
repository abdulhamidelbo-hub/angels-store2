// src/components/ads/AdManager.tsx
// إدارة الإعلانات باستخدام Google AdMob مع معرفات الاختبار

import React, { useEffect, useState } from 'react';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { THEME } from '../../constants/theme';

// معرفات الاختبار من Google AdMob
const TEST_AD_UNITS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  interstitial: Platform.select({
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  native: Platform.select({
    ios: 'ca-app-pub-3940256099942544/3986624511',
    android: 'ca-app-pub-3940256099942544/2247696110',
    default: 'ca-app-pub-3940256099942544/2247696110',
  }),
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
};

// Placeholder Banner Ad for development/web
export const BannerAd: React.FC<{
  size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE';
  style?: any;
}> = ({ size = 'BANNER', style }) => {
  const [isWeb, setIsWeb] = useState(false);
  
  useEffect(() => {
    setIsWeb(Platform.OS === 'web');
  }, []);

  // On web, show placeholder
  if (isWeb) {
    return (
      <View style={[styles.bannerPlaceholder, style]}>
        <Text style={styles.placeholderText}>
          [Ad Banner - Test Mode]
        </Text>
        <Text style={styles.placeholderSubtext}>
          Real ads will appear on mobile devices
        </Text>
      </View>
    );
  }

  // For native platforms, we would use the actual AdMob SDK
  // This is a placeholder for now
  return (
    <View style={[styles.bannerPlaceholder, style]}>
      <Text style={styles.placeholderText}>
        AdMob Banner
      </Text>
    </View>
  );
};

// Banner Ad for Categories Screen
export const CategoriesBannerAd: React.FC = () => {
  return (
    <View style={styles.categoriesBanner}>
      <BannerAd size="BANNER" />
    </View>
  );
};

// Banner Ad for Settings Screen
export const SettingsBannerAd: React.FC = () => {
  return (
    <View style={styles.settingsBanner}>
      <BannerAd size="LARGE_BANNER" />
    </View>
  );
};

// Ad Counter for Interstitial (show after every 3 category views)
let categoryViewCount = 0;

export const incrementCategoryView = (): boolean => {
  categoryViewCount++;
  if (categoryViewCount >= 3) {
    categoryViewCount = 0;
    return true; // Should show interstitial
  }
  return false;
};

export const showInterstitialAd = async (): Promise<void> => {
  // On web, just log
  if (Platform.OS === 'web') {
    console.log('[AdMob] Interstitial would show on mobile');
    return;
  }
  
  // For native, we would load and show the interstitial
  // This is a placeholder
  console.log('[AdMob] Showing interstitial ad...');
};

export const showRewardedAd = async (): Promise<boolean> => {
  // On web, just simulate success
  if (Platform.OS === 'web') {
    console.log('[AdMob] Rewarded ad would show on mobile');
    return true;
  }
  
  // For native, we would load and show the rewarded ad
  // This is a placeholder
  console.log('[AdMob] Showing rewarded ad...');
  return true;
};

const styles = StyleSheet.create({
  bannerPlaceholder: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
    minHeight: 50,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  placeholderSubtext: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  categoriesBanner: {
    marginHorizontal: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  settingsBanner: {
    marginHorizontal: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  },
});

export default {
  BannerAd,
  CategoriesBannerAd,
  SettingsBannerAd,
  incrementCategoryView,
  showInterstitialAd,
  showRewardedAd,
  TEST_AD_UNITS,
};
