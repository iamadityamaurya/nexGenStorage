/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { formatBytes } from '@/services/folderManager';

interface FileCardProps {
  message: any;
  displayName: string;
  isDownloading?: boolean;
  onDownload: () => void;
  onDelete: () => void;
}

const getFileIconInfo = (
  name: string,
  mimeType?: string
): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
  const ext = name.split('.').pop()?.toLowerCase() || '';

  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
    return { icon: 'image', color: '#38BDF8' };
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || mimeType?.startsWith('video/')) {
    return { icon: 'videocam', color: '#F43F5E' };
  }
  if (['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(ext) || mimeType?.startsWith('audio/')) {
    return { icon: 'musical-notes', color: '#A855F7' };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return { icon: 'archive', color: '#F59E0B' };
  }
  if (['pdf', 'doc', 'docx', 'txt', 'csv', 'xlsx', 'pptx'].includes(ext)) {
    return { icon: 'document-text', color: '#10B981' };
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json'].includes(ext)) {
    return { icon: 'code-slash', color: '#818CF8' };
  }
  return { icon: 'document', color: Colors.dark.primaryLight };
};

export const FileCard: React.FC<FileCardProps> = ({
  message,
  displayName,
  isDownloading = false,
  onDownload,
  onDelete,
}) => {
  const size = message.media?.document?.size || 0;
  const mimeType = message.media?.document?.mimeType;
  const { icon, color } = getFileIconInfo(displayName, mimeType);

  const formattedDate = message.date
    ? new Date(message.date * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown Date';

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}18`, borderColor: `${color}35` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{formatBytes(size)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.metaText}>{formattedDate}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.downloadBtn]}
          onPress={onDownload}
          disabled={isDownloading}
          activeOpacity={0.7}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={Colors.dark.primaryLight} />
          ) : (
            <Ionicons name="cloud-download-outline" size={17} color={Colors.dark.primaryLight} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.dark.errorLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  dot: {
    color: Colors.dark.textMuted,
    marginHorizontal: 5,
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});
