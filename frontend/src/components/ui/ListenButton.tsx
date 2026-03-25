import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { speechService } from '../../services/speechService';
import { THEME } from '../../constants/theme';

interface ListenButtonProps {
  text: string;
  language?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  showLabel?: boolean;
}

export const ListenButton: React.FC<ListenButtonProps> = ({
  text,
  language = 'ar',
  label,
  size = 'medium',
  variant = 'primary',
  showLabel = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  const handlePress = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isPlaying) {
      await speechService.stop();
      setIsPlaying(false);
      pulseScale.value = 1;
      return;
    }

    setIsLoading(true);
    setIsPlaying(true);

    // Start pulse animation
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    try {
      await speechService.speak(text, {
        language,
        onStart: () => setIsLoading(false),
        onDone: () => {
          setIsPlaying(false);
          pulseScale.value = withTiming(1, { duration: 200 });
        },
        onError: () => {
          setIsPlaying(false);
          setIsLoading(false);
          pulseScale.value = withTiming(1, { duration: 200 });
        },
      });
    } catch (error) {
      setIsPlaying(false);
      setIsLoading(false);
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [text, language, isPlaying]);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.3 : 0,
  }));

  const getSize = () => {
    switch (size) {
      case 'small':
        return { button: 36, icon: 18, text: 12 };
      case 'large':
        return { button: 56, icon: 28, text: 16 };
      default:
        return { button: 44, icon: 22, text: 14 };
    }
  };

  const sizeConfig = getSize();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: THEME.colors.gold + '20',
          icon: THEME.colors.gold,
          text: THEME.colors.gold,
        };
      case 'outline':
        return {
          bg: 'transparent',
          icon: THEME.colors.primary,
          text: THEME.colors.primary,
          border: THEME.colors.primary,
        };
      default:
        return {
          bg: THEME.colors.primary + '15',
          icon: THEME.colors.primary,
          text: THEME.colors.primary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isLoading}
    >
      <Animated.View
        style={[
          styles.container,
          buttonStyle,
          showLabel && styles.containerWithLabel,
        ]}
      >
        {/* Pulse Effect */}
        <Animated.View
          style={[
            styles.pulse,
            {
              width: sizeConfig.button,
              height: sizeConfig.button,
              borderRadius: sizeConfig.button / 2,
              backgroundColor: variantStyles.icon,
            },
            pulseStyle,
          ]}
        />

        {/* Button */}
        <View
          style={[
            styles.button,
            {
              width: sizeConfig.button,
              height: sizeConfig.button,
              borderRadius: sizeConfig.button / 2,
              backgroundColor: variantStyles.bg,
              borderWidth: variant === 'outline' ? 2 : 0,
              borderColor: variantStyles.border,
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={variantStyles.icon} />
          ) : (
            <Ionicons
              name={isPlaying ? 'stop' : 'volume-high'}
              size={sizeConfig.icon}
              color={variantStyles.icon}
            />
          )}
        </View>

        {/* Label */}
        {showLabel && label && (
          <Text
            style={[
              styles.label,
              { fontSize: sizeConfig.text, color: variantStyles.text },
            ]}
          >
            {label}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerWithLabel: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  label: {
    fontWeight: '600',
  },
});
