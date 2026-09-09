/**
 * NexGenStorage Theme & Color Palette
 */

import { Platform } from 'react-native';

export const Colors = {
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#07080F',
    surface1: '#0D0F1C',
    surface2: '#111320',
    surface3: '#161828',
    card: '#0F1222',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    tint: '#6366F1',
    icon: '#94A3B8',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    violet: '#8B5CF6',
    emerald: '#10B981',
    emeraldLight: '#34D399',
    error: '#EF4444',
    errorLight: '#F87171',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
  },
  light: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    background: '#07080F',
    surface1: '#0D0F1C',
    surface2: '#111320',
    surface3: '#161828',
    card: '#0F1222',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    tint: '#6366F1',
    icon: '#94A3B8',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    violet: '#8B5CF6',
    emerald: '#10B981',
    emeraldLight: '#34D399',
    error: '#EF4444',
    errorLight: '#F87171',
    tabIconDefault: '#64748B',
    tabIconSelected: '#818CF8',
  },
};

export const Fonts = Platform.select({
  ios: {
    regular: 'System',
    bold: 'System',
  },
  default: {
    regular: 'normal',
    bold: 'bold',
  },
});
