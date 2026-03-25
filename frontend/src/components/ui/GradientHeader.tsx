import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { THEME } from '../../constants/theme';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  large?: boolean;
}

export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightIcon,
  onRightPress,
  large = false,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <LinearGradient
      colors={THEME.gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        large && styles.containerLarge,
      ]}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Back Button */}
        {showBack && (
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Title & Subtitle */}
        <View style={[styles.titleContainer, !showBack && styles.titleNoBack]}>
          <Text style={[styles.title, large && styles.titleLarge]}>
            {title}
          </Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Right Icon */}
        {rightIcon && onRightPress ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      {/* Decorative bottom wave */}
      <View style={styles.wave} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg + 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  containerLarge: {
    paddingBottom: THEME.spacing.xl + 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 44,
    height: 44,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  titleNoBack: {
    alignItems: 'flex-start',
    marginLeft: THEME.spacing.sm,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleLarge: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'transparent',
  },
});
