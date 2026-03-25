import React, { useEffect } from 'react';
import {
  StyleSheet,
  ViewStyle,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { THEME } from '../../constants/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  delay?: number;
  gradient?: readonly [string, string, ...string[]];
  enableHover?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  delay = 0,
  gradient,
  enableHover = true,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  useEffect(() => {
    // Animate in
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 80 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      {
        scale: withSpring(isPressed.value ? 0.97 : scale.value, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const handlePressIn = () => {
    if (enableHover && onPress) {
      isPressed.value = true;
    }
  };

  const handlePressOut = () => {
    if (enableHover && onPress) {
      isPressed.value = false;
    }
  };

  const content = gradient ? (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={[styles.card, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <Animated.View style={containerStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <Animated.View style={containerStyle}>{content}</Animated.View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
  gradient: {
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    ...THEME.shadows.medium,
  },
});
