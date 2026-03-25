import { useRef, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Hook للحركات الأساسية
export const useScaleAnimation = (initialScale = 1) => {
  const scale = useSharedValue(initialScale);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scaleIn = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  };

  const scaleOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withSpring(1, { damping: 10, stiffness: 100 })
    );
  };

  return { scale, animatedStyle, scaleIn, scaleOut, pulse };
};

// Hook للعداد المتحرك
export const useCounterAnimation = () => {
  const count = useSharedValue(0);
  const floatingNumbers: Animated.SharedValue<number>[] = [];

  const animatedCountStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(count.value % 1, [0, 0.5, 1], [1, 1.1, 1]),
      },
    ],
  }));

  const incrementWithAnimation = (newCount: number) => {
    count.value = withSequence(
      withTiming(newCount - 0.5, { duration: 50 }),
      withSpring(newCount, { damping: 15, stiffness: 200 })
    );
  };

  return { count, animatedCountStyle, incrementWithAnimation };
};

// Hook للظهور المتدرج
export const useFadeInAnimation = (delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const fadeIn = () => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  };

  const fadeOut = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(20, { duration: 200 });
  };

  return { opacity, translateY, animatedStyle, fadeIn, fadeOut };
};

// Hook للضغط على الزر
export const usePressAnimation = () => {
  const pressed = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(pressed.value ? 0.95 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
    opacity: pressed.value ? 0.9 : 1,
  }));

  const onPressIn = () => {
    pressed.value = true;
  };

  const onPressOut = () => {
    pressed.value = false;
  };

  return { pressed, animatedStyle, onPressIn, onPressOut };
};

// Hook للرقم العائم
export const useFloatingNumber = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const show = () => {
    opacity.value = 1;
    scale.value = 0.5;
    translateY.value = 0;

    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(300, withTiming(0, { duration: 400 }))
    );

    scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });

    translateY.value = withTiming(-60, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  };

  return { animatedStyle, show };
};

// Hook للاهتزاز
export const useHapticFeedback = () => {
  const triggerLight = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerMedium = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerHeavy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const triggerSuccess = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerWarning = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const triggerError = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const triggerSelection = async () => {
    await Haptics.selectionAsync();
  };

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerWarning,
    triggerError,
    triggerSelection,
  };
};
