import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </Component>
  );
};

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  style,
}) => {
  const getButtonStyle = () => {
    const base = [styles.button, styles[`button_${size}`]];
    
    if (disabled) {
      base.push(styles.button_disabled);
    } else {
      base.push(styles[`button_${variant}`]);
    }
    
    if (style) base.push(style);
    
    return base;
  };

  const getTextStyle = () => {
    return [
      styles.buttonText,
      styles[`buttonText_${size}`],
      variant === 'outline' && styles.buttonText_outline,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
          color={variant === 'outline' ? COLORS.primary : '#FFFFFF'}
          style={styles.buttonIcon}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

interface CounterProps {
  count: number;
  target?: number;
  onIncrement: () => void;
  onReset: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const Counter: React.FC<CounterProps> = ({
  count,
  target,
  onIncrement,
  onReset,
  size = 'large',
}) => {
  const progress = target ? (count / target) * 100 : 0;

  return (
    <View style={styles.counterContainer}>
      {target && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.counterButton, styles[`counter_${size}`]]}
        onPress={onIncrement}
        activeOpacity={0.8}
      >
        <Text style={[styles.counterText, styles[`counterText_${size}`]]}>{count}</Text>
        {target && (
          <Text style={styles.counterTarget}>/ {target}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
      >
        <Ionicons name="refresh" size={24} color={COLORS.primary} />
        <Text style={styles.resetText}>إعادة</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },

  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  button_small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_medium: {
    paddingVertical: 12,
  },
  button_large: {
    paddingVertical: 16,
  },
  button_primary: {
    backgroundColor: COLORS.primary,
  },
  button_secondary: {
    backgroundColor: COLORS.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  button_danger: {
    backgroundColor: COLORS.error,
  },
  button_disabled: {
    backgroundColor: COLORS.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  buttonText_outline: {
    color: COLORS.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Counter
  counterContainer: {
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  counterButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  counter_small: {
    width: 120,
    height: 120,
  },
  counter_medium: {
    width: 180,
    height: 180,
  },
  counter_large: {
    width: 240,
    height: 240,
  },
  counterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  counterText_small: {
    fontSize: 32,
  },
  counterText_medium: {
    fontSize: 48,
  },
  counterText_large: {
    fontSize: 64,
  },
  counterTarget: {
    color: '#FFFFFF',
    fontSize: 20,
    marginTop: 4,
    opacity: 0.8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  resetText: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
});
