import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'glow' | 'accent' | 'subtle';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, variant = 'default' }) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'glow' && styles.glow,
        variant === 'accent' && styles.accent,
        variant === 'subtle' && styles.subtle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    overflow: 'hidden',
  },
  glow: {
    borderColor: 'rgba(99, 102, 241, 0.3)',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  accent: {
    borderColor: 'rgba(6, 182, 212, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  subtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
