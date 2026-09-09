import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export interface ChatItem {
  id: string;
  name: string;
  isChannel?: boolean;
  isGroup?: boolean;
}

interface DriveCardProps {
  chat: ChatItem;
  onPress: () => void;
}

export const DriveCard: React.FC<DriveCardProps> = ({ chat, onPress }) => {
  const initials = (chat.name || 'Chat')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {chat.name}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {chat.isChannel ? 'Channel' : chat.isGroup ? 'Group' : 'Chat'}
            </Text>
          </View>
          <Text style={styles.idText} numberOfLines={1}>
            ID: {chat.id}
          </Text>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={Colors.dark.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark.surface3,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: Colors.dark.primaryLight,
    fontWeight: '700',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
    textTransform: 'uppercase',
  },
  idText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  arrowContainer: {
    paddingLeft: 8,
  },
});
