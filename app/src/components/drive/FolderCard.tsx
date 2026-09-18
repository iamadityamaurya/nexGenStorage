import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Folder, Trash2, Edit3 } from 'lucide-react-native';
import { FolderNode } from '../../services/folderManager';
import { GlassCard } from '../common/GlassCard';

interface FolderCardProps {
  folder: FolderNode;
  fileCount?: number;
  onPress: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  fileCount = 0,
  onPress,
  onRename,
  onDelete,
}) => {
  const isUncategorised = folder.uid === 'uncategorised';

  return (
    <GlassCard style={styles.card} variant={isUncategorised ? 'subtle' : 'default'}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.touchArea}>
        <View style={styles.topRow}>
          <View style={[styles.iconContainer, isUncategorised ? styles.uncategorisedIcon : null]}>
            <Folder size={22} color={isUncategorised ? '#94a3b8' : '#818cf8'} />
          </View>

          {!isUncategorised && (onRename || onDelete) && (
            <View style={styles.actionButtons}>
              {onRename && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onRename();
                  }}
                  style={styles.actionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={15} color="#94a3b8" />
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  style={[styles.actionBtn, styles.deleteBtn]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 size={15} color="#f87171" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.infoArea}>
          <Text style={styles.folderName} numberOfLines={1} ellipsizeMode="tail">
            {folder.name}
          </Text>
          <Text style={styles.metaText}>
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </Text>
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginVertical: 4,
  },
  touchArea: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncategorisedIcon: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  infoArea: {
    marginTop: 2,
  },
  folderName: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  metaText: {
    color: '#64748b',
    fontSize: 12,
  },
});
