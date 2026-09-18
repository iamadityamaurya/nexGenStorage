import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Archive,
  Code,
  File,
  Download,
} from 'lucide-react-native';
import { TelegramFileItem } from '../../hooks/useDriveFiles';
import { formatBytes, formatDate, getFileCategory } from '../../utils/fileTypes';
import { GlassCard } from '../common/GlassCard';

interface FileCardProps {
  file: TelegramFileItem;
  viewMode?: 'grid' | 'list';
  onPress: () => void;
  onDownload?: () => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  viewMode = 'grid',
  onPress,
  onDownload,
}) => {
  const categoryInfo = getFileCategory(file.fileName || '');

  const renderIcon = () => {
    const size = viewMode === 'grid' ? 24 : 20;
    const color = categoryInfo.color;

    switch (categoryInfo.category) {
      case 'image':
        return <ImageIcon size={size} color={color} />;
      case 'video':
        return <VideoIcon size={size} color={color} />;
      case 'audio':
        return <Music size={size} color={color} />;
      case 'document':
        return <FileText size={size} color={color} />;
      case 'archive':
        return <Archive size={size} color={color} />;
      case 'code':
        return <Code size={size} color={color} />;
      default:
        return <File size={size} color={color} />;
    }
  };

  if (viewMode === 'list') {
    return (
      <GlassCard style={styles.listCard}>
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.listRow}>
          <View style={[styles.listIconContainer, { backgroundColor: categoryInfo.badgeBg }]}>
            {renderIcon()}
          </View>

          <View style={styles.listDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.fileName || 'Untitled File'}
            </Text>
            <View style={styles.listMetaRow}>
              <Text style={styles.metaBadge}>{formatBytes(file.fileSize || 0)}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{formatDate(file.date)}</Text>
            </View>
          </View>

          {onDownload && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              style={styles.downloadBtn}
            >
              <Download size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.gridCard}>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.gridContainer}>
        <View style={[styles.gridIconContainer, { backgroundColor: categoryInfo.badgeBg }]}>
          {renderIcon()}
        </View>

        <View style={styles.gridDetails}>
          <Text style={styles.fileName} numberOfLines={2}>
            {file.fileName || 'Untitled File'}
          </Text>
          <View style={styles.gridMetaRow}>
            <Text style={styles.metaBadge}>{formatBytes(file.fileSize || 0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    padding: 12,
    marginVertical: 4,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gridIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridDetails: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gridMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  listCard: {
    padding: 12,
    marginVertical: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listDetails: {
    flex: 1,
    marginRight: 8,
  },
  listMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  fileName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
  },
  metaBadge: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  metaDot: {
    color: '#64748b',
    marginHorizontal: 6,
    fontSize: 10,
  },
  metaText: {
    color: '#64748b',
    fontSize: 11,
  },
  downloadBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});
