import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    color?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title = 'NexGenStorage',
  subtitle,
  showBack = false,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.dark.text} />
          </TouchableOpacity>
        )}
        {!showBack && (
          <View style={styles.logoBadge}>
            <Ionicons name="cloud" size={18} color="#FFF" />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={styles.rightButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={rightAction.icon}
            size={20}
            color={rightAction.color || Colors.dark.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.dark.surface1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  rightButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
});
