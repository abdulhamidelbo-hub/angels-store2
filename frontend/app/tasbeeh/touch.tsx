import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../src/constants/theme';
import { apiService } from '../../src/services/api';
import { useApp } from '../../src/contexts/AppContext';
import { AnimatedCounter } from '../../src/components/ui';

const { width } = Dimensions.get('window');

export default function TouchTasbeehScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshStats } = useApp();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const headerScale = useSharedValue(1);

  const handleIncrement = useCallback(() => {
    const newCount = count + 1;
    setCount(newCount);

    // Save to backend every 10 counts
    if (newCount % 10 === 0) {
      saveProgress(10);
    }
  }, [count]);

  const handleReset = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (count > 0) {
      saveProgress(count % 10);
    }
    setCount(0);
  }, [count]);

  const saveProgress = async (countToSave: number) => {
    if (isSaving || countToSave === 0) return;
    
    setIsSaving(true);
    try {
      await apiService.recordTasbeeh({
        method: 'touch',
        count: countToSave,
      });
      await refreshStats();
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save progress when leaving screen
  useEffect(() => {
    return () => {
      const remaining = count % 10;
      if (remaining > 0) {
        apiService.recordTasbeeh({
          method: 'touch',
          count: remaining,
        });
      }
    };
  }, [count]);

  const targets = [33, 99, 100, 1000];

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
        <View style={styles.headerContent}>
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
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>العد باللمس</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Counter */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.counterContainer}
        >
          <AnimatedCounter
            count={count}
            target={target}
            onIncrement={handleIncrement}
            onReset={handleReset}
          />
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.tipsContainer}
        >
          <LinearGradient
            colors={[THEME.colors.primary + '15', THEME.colors.primary + '08']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.tipsGradient}
          >
            <Ionicons name="information-circle" size={20} color={THEME.colors.primary} />
            <Text style={styles.tipsText}>
              اضغط على الدائرة للتسبيح • سيهتز الهاتف مع كل ضغطة
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Target Selector */}
        <Animated.View
          entering={FadeInDown.delay(600).springify()}
          style={styles.targetSection}
        >
          <Text style={styles.targetTitle}>اختر الهدف:</Text>
          <View style={styles.targetsRow}>
            {targets.map((t) => (
              <Pressable
                key={t}
                style={({ pressed }) => [
                  styles.targetButton,
                  target === t && styles.targetButtonActive,
                  pressed && styles.targetButtonPressed,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTarget(t);
                }}
              >
                {target === t ? (
                  <LinearGradient
                    colors={THEME.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.targetButtonGradient}
                  >
                    <Text style={styles.targetButtonTextActive}>{t}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.targetButtonText}>{t}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Celebration message */}
        {count >= target && (
          <Animated.View
            entering={FadeIn.springify()}
            style={styles.celebrationContainer}
          >
            <LinearGradient
              colors={THEME.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.celebrationGradient}
            >
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
              <Text style={styles.celebrationText}>
                ماشاء الله! أكملت الهدف 🎉
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </View>
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.xl,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  tipsContainer: {
    marginBottom: THEME.spacing.xl,
  },
  tipsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.md,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.text,
    marginLeft: THEME.spacing.sm,
    lineHeight: 20,
  },
  targetSection: {
    marginBottom: THEME.spacing.lg,
  },
  targetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: THEME.spacing.sm,
  },
  targetButton: {
    flex: 1,
    height: 48,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.border,
    ...THEME.shadows.small,
  },
  targetButtonActive: {
    borderColor: 'transparent',
    padding: 0,
    overflow: 'hidden',
  },
  targetButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  targetButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.md - 2,
  },
  targetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  targetButtonTextActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  celebrationContainer: {
    marginTop: THEME.spacing.md,
  },
  celebrationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.goldGlow,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: THEME.spacing.sm,
  },
});
