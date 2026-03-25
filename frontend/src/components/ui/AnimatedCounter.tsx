import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';

const { width } = Dimensions.get('window');
const COUNTER_SIZE = Math.min(width * 0.6, 260);

interface AnimatedCounterProps {
  count: number;
  target?: number;
  onIncrement: () => void;
  onReset: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  count,
  target = 33,
  onIncrement,
  onReset,
}) => {
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const floatingOpacity = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const floatingScale = useSharedValue(0.5);
  const progressWidth = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  // Update progress bar
  React.useEffect(() => {
    progressWidth.value = withSpring(progress, { damping: 15, stiffness: 100 });
    
    if (count > 0 && count === target) {
      // Celebration!
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 200 }),
        withTiming(0.3, { duration: 500 })
      );
    }
  }, [count, target, progress]);

  const triggerHaptic = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const triggerSuccessHaptic = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handlePress = useCallback(() => {
    // Scale animation
    scale.value = withSequence(
      withTiming(0.92, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.4;
    rippleScale.value = withTiming(1.5, { duration: 400, easing: Easing.out(Easing.cubic) });
    rippleOpacity.value = withDelay(100, withTiming(0, { duration: 300 }));

    // Floating number
    floatingOpacity.value = 1;
    floatingY.value = 0;
    floatingScale.value = 0.5;
    floatingOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(300, withTiming(0, { duration: 400 }))
    );
    floatingY.value = withTiming(-80, { duration: 800, easing: Easing.out(Easing.cubic) });
    floatingScale.value = withSpring(1.3, { damping: 8, stiffness: 100 });

    // Haptic feedback
    runOnJS(triggerHaptic)();
    
    // Increment count
    runOnJS(onIncrement)();

    // Success celebration at target
    if (count + 1 === target) {
      runOnJS(triggerSuccessHaptic)();
    }
  }, [count, target, onIncrement]);

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const floatingStyle = useAnimatedStyle(() => ({
    opacity: floatingOpacity.value,
    transform: [
      { translateY: floatingY.value },
      { scale: floatingScale.value },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, progressStyle]}>
            <LinearGradient
              colors={THEME.gradients.gold}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
        <Text style={styles.progressText}>
          {count} / {target}
        </Text>
      </View>

      {/* Counter Button */}
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.counterWrapper, counterStyle]}>
          {/* Glow Effect */}
          <Animated.View style={[styles.glow, glowStyle]} />
          
          {/* Ripple */}
          <Animated.View style={[styles.ripple, rippleStyle]} />
          
          {/* Main Button */}
          <LinearGradient
            colors={THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.counter}
          >
            <Text style={styles.countText}>{count}</Text>
            <Text style={styles.tapText}>اضغط للتسبيح</Text>
          </LinearGradient>

          {/* Floating Number */}
          <Animated.View style={[styles.floatingNumber, floatingStyle]}>
            <Text style={styles.floatingText}>+1</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Reset Button */}
      <Pressable
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
        onPress={onReset}
      >
        <Ionicons name="refresh" size={22} color={THEME.colors.primary} />
        <Text style={styles.resetText}>إعادة العداد</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    width: '100%',
    marginBottom: THEME.spacing.xl,
  },
  progressBg: {
    height: 10,
    backgroundColor: THEME.colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  counterWrapper: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  glow: {
    position: 'absolute',
    width: COUNTER_SIZE + 40,
    height: COUNTER_SIZE + 40,
    borderRadius: (COUNTER_SIZE + 40) / 2,
    backgroundColor: THEME.colors.primary,
  },
  ripple: {
    position: 'absolute',
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    backgroundColor: THEME.colors.gold,
  },
  counter: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    borderRadius: COUNTER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.glow,
  },
  countText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tapText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  floatingNumber: {
    position: 'absolute',
    top: COUNTER_SIZE / 2 - 30,
  },
  floatingText: {
    fontSize: 36,
    fontWeight: '700',
    color: THEME.colors.gold,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
    ...THEME.shadows.small,
  },
  resetButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.primary,
    marginLeft: 8,
  },
});
