import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
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

interface CategoryCardProps {
  id: number;
  nameAr: string;
  nameEn?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  count?: number;
  onPress: () => void;
  delay?: number;
  variant?: 'list' | 'grid';
  isRTL?: boolean;
  currentLanguage?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  nameAr,
  nameEn,
  icon,
  color,
  count,
  onPress,
  delay = 0,
  variant = 'list',
  isRTL = true,
  currentLanguage = 'ar',
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(variant === 'list' ? 50 : 0);
  const translateY = useSharedValue(variant === 'grid' ? 30 : 0);
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    translateX.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 80 })
    );
    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 15, stiffness: 80 })
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        scale: withSpring(isPressed.value ? 0.97 : 1, {
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

  // Get the display name based on current language
  const displayName = currentLanguage === 'ar' ? nameAr : (nameEn || nameAr);

  if (variant === 'grid') {
    return (
      <Animated.View style={[styles.gridContainer, containerStyle]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.gridPressable}
        >
          <View style={[styles.gridCard, { borderColor: color + '40' }]}>
            <View style={[styles.gridIconContainer, { backgroundColor: color + '15' }]}>
              <Ionicons name={icon} size={32} color={color} />
            </View>
            <Text style={[styles.gridTitle, isRTL && styles.textRTL]} numberOfLines={2}>
              {displayName}
            </Text>
            {count !== undefined && (
              <View style={[styles.countBadge, isRTL ? styles.countBadgeRTL : null, { backgroundColor: color }]}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={containerStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.listCard, isRTL && styles.listCardRTL]}>
          {/* Icon Container with Gradient Background */}
          <LinearGradient
            colors={[color + '20', color + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.iconContainer, isRTL && styles.iconContainerRTL]}
          >
            <Ionicons name={icon} size={28} color={color} />
          </LinearGradient>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{displayName}</Text>
            {nameEn && currentLanguage !== 'en' && <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{nameEn}</Text>}
          </View>

          {/* Count Badge */}
          {count !== undefined && (
            <View style={[styles.listCountBadge, isRTL && styles.listCountBadgeRTL, { backgroundColor: color + '15' }]}>
              <Text style={[styles.listCountText, { color }]}>{count}</Text>
            </View>
          )}

          {/* Arrow */}
          <Ionicons
            name={isRTL ? "chevron-back" : "chevron-forward"}
            size={22}
            color={THEME.colors.textMuted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // List variant
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.small,
  },
  listCardRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: THEME.spacing.md,
  },
  iconContainerRTL: {
    marginRight: 0,
    marginLeft: THEME.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
  },
  textRTL: {
    textAlign: 'right',
  },
  listCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.sm,
    marginRight: THEME.spacing.sm,
  },
  listCountBadgeRTL: {
    marginRight: 0,
    marginLeft: THEME.spacing.sm,
  },
  listCountText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Grid variant
  gridContainer: {
    width: '48%',
    marginBottom: THEME.spacing.md,
  },
  gridPressable: {
    flex: 1,
  },
  gridCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    minHeight: 130,
    ...THEME.shadows.small,
  },
  gridIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeRTL: {
    right: 'auto',
    left: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
