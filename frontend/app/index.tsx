import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../src/constants/colors';
import { storage, STORAGE_KEYS } from '../src/utils/storage';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if onboarding is complete
      const onboardingComplete = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);

      if (onboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>أذكار</Text>
          <Text style={styles.logoSubtext}>المسلم</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.bismillah}>بسم الله الرحمن الرحيم</Text>
        <Text style={styles.version}>نسخة 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  logoSubtext: {
    fontSize: 32,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  bismillah: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
    opacity: 0.9,
  },
  version: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
});
