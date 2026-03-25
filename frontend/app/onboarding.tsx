import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../src/components/Common';
import { COLORS } from '../src/constants/colors';
import { storage, STORAGE_KEYS } from '../src/utils/storage';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    title: 'أذكار صحيحة موثقة',
    description: 'جميع الأذكار من مصادر موثوقة: البخاري، مسلم، أبو داود، الترمذي',
    icon: 'book',
  },
  {
    title: 'ثلاث طرق للتسبيح',
    description: 'العد باللمس • العد بالصوت • المساعد الذكي',
    icon: 'hand-left',
  },
  {
    title: 'مواقيت الصلاة',
    description: 'مواقيت دقيقة مع إشعارات لكل صلاة',
    icon: 'time',
  },
  {
    title: 'تحديات وإنجازات',
    description: 'اجمع النقاط واحصل على الشارات الروحية',
    icon: 'trophy',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  const handleNext = () => {
    if (currentPage < onboardingData.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    await storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
    router.replace('/(tabs)');
  };

  const currentData = onboardingData[currentPage];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📚</Text>
          </View>
        </View>

        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>

        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {currentPage < onboardingData.length - 1 && (
          <Button
            title="تخطي"
            onPress={handleSkip}
            variant="outline"
            size="medium"
            style={styles.skipButton}
          />
        )}
        
        <Button
          title={currentPage === onboardingData.length - 1 ? 'ابدأ الآن' : 'التالي'}
          onPress={handleNext}
          variant="primary"
          size="large"
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 48,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  skipButton: {
    marginBottom: 16,
  },
  nextButton: {
    width: '100%',
  },
});
