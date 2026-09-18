import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    onPress();
  };

  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[size],
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        variant === 'glass' && styles.glass,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient
          colors={disabled ? ['#334155', '#1e293b'] : ['#6366f1', '#4f46e5', '#4338ca']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradientRadius]}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            style={[
              styles.text,
              styles[`text_${size}` as keyof typeof styles],
              variant === 'ghost' && styles.textGhost,
              variant === 'danger' && styles.textDanger,
              disabled && styles.textDisabled,
              icon ? { marginLeft: 8 } : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientRadius: {
    borderRadius: 12,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
  text_sm: {
    fontSize: 13,
  },
  text_md: {
    fontSize: 15,
  },
  text_lg: {
    fontSize: 16,
  },
  textGhost: {
    color: '#94a3b8',
  },
  textDanger: {
    color: '#f87171',
  },
  textDisabled: {
    color: '#64748b',
  },
});
