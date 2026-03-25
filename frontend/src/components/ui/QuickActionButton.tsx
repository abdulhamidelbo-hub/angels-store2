import React, { useEffect } from 'react';
import {
  Text,
  StyleSheet,
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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { THEME } from '../../constants/theme';

interface QuickActionButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress: () => void;
  delay?: number;
  badge?: number;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  title,
  icon,
  color = THEME.colors.primary,
  onPress,
  delay = 0,
  badge,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 80 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      {
        scale: withSpring(isPressed.value ? 0.9 : 1, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const handlePressIn = () => {
    isPressed.value = true;
    Haptics.selectionAsync();
  };

  const handlePressOut = () => {
    isPressed.value = false;
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={26} color={color} />
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: THEME.spacing.xs,
  },
  pressable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.small,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.colors.error,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
