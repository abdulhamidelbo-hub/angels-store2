import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../src/constants/theme';
import { AnimatedCard } from '../../src/components/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pressCountRef = useRef(0);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogoPress = useCallback(() => {
    pressCountRef.current += 1;
    Haptics.selectionAsync();

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }

    pressTimerRef.current = setTimeout(() => {
      pressCountRef.current = 0;
    }, 2000);

    if (pressCountRef.current >= 5) {
      pressCountRef.current = 0;
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'مرحباً أيها المالك',
        'جاري فتح لوحة التحكم...',
        [{ text: 'دخول', onPress: () => router.push('/admin') }],
        { cancelable: false }
      );
    }
  }, [router]);

  const settingsSections = [
    {
      title: 'عام',
      icon: 'settings',
      items: [
        { title: 'اللغة', icon: 'language', value: 'العربية', onPress: () => {} },
        { title: 'حجم الخط', icon: 'text', value: 'متوسط', onPress: () => {} },
        {
          title: 'الوضع الليلي',
          icon: 'moon',
          toggle: true,
          value: darkMode,
          onToggle: () => setDarkMode((prev) => !prev),
        },
      ],
    },
    {
      title: 'الإشعارات',
      icon: 'notifications',
      items: [
        {
          title: 'إشعارات الصلاة',
          icon: 'time',
          toggle: true,
          value: notifications,
          onToggle: () => setNotifications((prev) => !prev),
        },
        { title: 'إشعارات الأذكار', icon: 'alarm', value: 'مفعّل', onPress: () => {} },
        { title: 'إشعارات المناسبات', icon: 'calendar', value: 'مفعّل', onPress: () => {} },
      ],
    },
    {
      title: 'الاشتراك',
      icon: 'diamond',
      items: [
        { title: 'حالة الاشتراك', icon: 'card', value: 'مفعّل', onPress: () => router.push('/subscription' as any) },
        { title: 'تجديد الاشتراك', icon: 'refresh', onPress: () => router.push('/subscription' as any) },
      ],
    },
    {
      title: 'عن التطبيق',
      icon: 'information-circle',
      items: [
        { title: 'معلومات التطبيق', icon: 'information-circle', onPress: () => {} },
        { title: 'شارك التطبيق', icon: 'share-social', onPress: () => {} },
        { title: 'قيّم التطبيق', icon: 'star', onPress: () => {} },
      ],
    },
  ];

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
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={sectionIndex}
            entering={FadeInDown.delay(sectionIndex * 100).springify()}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name={section.icon as any}
                size={18}
                color={THEME.colors.primary}
              />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={itemIndex}
                  style={({ pressed }) => [
                    styles.settingItem,
                    itemIndex !== section.items.length - 1 && styles.settingItemBorder,
                    pressed && !item.toggle && styles.settingItemPressed,
                  ]}
                  onPress={() => {
                    if (!item.toggle && item.onPress) {
                      Haptics.selectionAsync();
                      item.onPress();
                    }
                  }}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIconContainer}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={THEME.colors.primary}
                      />
                    </View>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>

                  {item.toggle ? (
                    <Switch
                      value={item.value as boolean}
                      onValueChange={() => {
                        Haptics.selectionAsync();
                        item.onToggle?.();
                      }}
                      trackColor={{
                        false: THEME.colors.border,
                        true: THEME.colors.primary + '60',
                      }}
                      thumbColor={item.value ? THEME.colors.primary : '#f4f3f4'}
                    />
                  ) : (
                    <View style={styles.settingRight}>
                      {item.value && (
                        <Text style={styles.settingValue}>{item.value}</Text>
                      )}
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={THEME.colors.textMuted}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* App Logo & Version - Tap 5 times to access Admin */}
        <Animated.View
          entering={FadeInDown.delay(500).springify()}
        >
          <Pressable
            style={({ pressed }) => [
              styles.versionContainer,
              pressed && styles.versionPressed,
            ]}
            onPress={handleLogoPress}
          >
            <LinearGradient
              colors={THEME.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoContainer}
            >
              <Ionicons name="leaf" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.versionText}>نسخة 1.0.0</Text>
            <Text style={styles.versionSubtext}>أذكار المسلم - بدون إعلانات</Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 32 }} />
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  section: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginLeft: THEME.spacing.xs,
  },
  sectionCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    overflow: 'hidden',
    ...THEME.shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.md,
    minHeight: 56,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  settingItemPressed: {
    backgroundColor: THEME.colors.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.sm,
  },
  settingTitle: {
    fontSize: 16,
    color: THEME.colors.text,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    marginRight: THEME.spacing.xs,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.xl,
  },
  versionPressed: {
    opacity: 0.7,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.glow,
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
  },
});
