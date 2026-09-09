import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { FolderNode } from '@/services/folderManager';

interface FolderCardProps {
  folder: FolderNode;
  onPress: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onPress,
  onRename,
  onDelete,
}) => {
  const isUncategorised = folder.uid === 'uncategorised';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, isUncategorised && styles.uncategorisedIcon]}>
        <Ionicons
          name={isUncategorised ? 'archive' : 'folder'}
          size={22}
          color={isUncategorised ? Colors.dark.violet : Colors.dark.primaryLight}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {folder.name}
        </Text>
        <Text style={styles.uidText} numberOfLines={1}>
          {isUncategorised ? 'System Default' : `UID: #${folder.uid}`}
        </Text>
      </View>

      {!isUncategorised && (
        <View style={styles.actionButtons}>
          {onRename && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                onRename();
              }}
            >
              <Ionicons name="pencil" size={15} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={(e) => {
                e.stopPropagation?.();
                onDelete();
              }}
            >
              <Ionicons name="trash-outline" size={15} color={Colors.dark.errorLight} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  uncategorisedIcon: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  uidText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  arrow: {
    paddingLeft: 4,
  },
});
