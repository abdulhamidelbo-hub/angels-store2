import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Common';
import { COLORS } from '../../src/constants/colors';

export default function SettingsScreen() {
  const router = useRouter();
  const pressCountRef = useRef(0);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoPress = useCallback(() => {
    pressCountRef.current += 1;

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }

    pressTimerRef.current = setTimeout(() => {
      pressCountRef.current = 0;
    }, 2000);

    if (pressCountRef.current >= 5) {
      pressCountRef.current = 0;
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
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
      items: [
        { title: 'اللغة', icon: 'language', onPress: () => {} },
        { title: 'الثيم', icon: 'color-palette', onPress: () => {} },
        { title: 'حجم الخط', icon: 'text', onPress: () => {} },
      ],
    },
    {
      title: 'الإشعارات',
      items: [
        { title: 'إشعارات الصلاة', icon: 'notifications', onPress: () => {} },
        { title: 'إشعارات الأذكار', icon: 'alarm', onPress: () => {} },
        { title: 'إشعارات المناسبات', icon: 'calendar', onPress: () => {} },
      ],
    },
    {
      title: 'الاشتراك',
      items: [
        { title: 'حالة الاشتراك', icon: 'card', onPress: () => {} },
        { title: 'تجديد الاشتراك', icon: 'refresh', onPress: () => {} },
      ],
    },
    {
      title: 'عن التطبيق',
      items: [
        { title: 'معلومات التطبيق', icon: 'information-circle', onPress: () => {} },
        { title: 'شارك التطبيق', icon: 'share-social', onPress: () => {} },
        { title: 'قيم التطبيق', icon: 'star', onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex !== section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Version Info - Tap logo 5 times to access Admin */}
        <TouchableOpacity
          style={styles.version}
          onPress={handleLogoPress}
          activeOpacity={0.8}
        >
          <Ionicons name="leaf" size={40} color={COLORS.primary} />
          <Text style={styles.versionText}>نسخة 1.0.0</Text>
          <Text style={styles.versionSubtext}>أذكار المسلم - بدون إعلانات</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  version: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    opacity: 0.7,
  },
});
