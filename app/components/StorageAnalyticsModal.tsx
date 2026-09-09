/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { getConnectedClient } from '@/services/telegramApi';
import { getStoredAuth } from '@/services/storage';
import { formatBytes } from '@/services/folderManager';

interface StorageAnalyticsModalProps {
  visible: boolean;
  selectedChatId: string;
  foldersCount: number;
  onClose: () => void;
}

const categoryConfig: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  images: { label: 'Images', color: '#10B981', icon: 'image' },
  videos: { label: 'Videos', color: '#8B5CF6', icon: 'videocam' },
  audio: { label: 'Audio', color: '#EC4899', icon: 'musical-notes' },
  documents: { label: 'Documents', color: '#3B82F6', icon: 'document-text' },
  archives: { label: 'Archives', color: '#F59E0B', icon: 'archive' },
  others: { label: 'Others', color: '#64748B', icon: 'folder' },
};

export const StorageAnalyticsModal: React.FC<StorageAnalyticsModalProps> = ({
  visible,
  selectedChatId,
  foldersCount,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalFiles: number;
    totalSize: number;
    categories: Record<string, { count: number; size: number }>;
    largestFiles: { name: string; size: number; category: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !selectedChatId) return;

    let active = true;
    const scan = async () => {
      try {
        setLoading(true);
        setError(null);
        const { apiId, apiHash, token } = await getStoredAuth();
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(selectedChatId, { limit: 1000, search: '_' }),
          client.getMessages(selectedChatId, { limit: 500 }),
        ]);

        if (!active) return;

        const uniqueMap = new Map();
        [...recentHistory, ...searchHistory].forEach((msg: any) => {
          if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });

        const appFiles = Array.from(uniqueMap.values()).filter((msg: any) => {
          if (!msg.media) return false;
          const text = (msg.message || '').trim();
          return /_\d{6}$/.test(text);
        });

        let totalSize = 0;
        const categories: Record<string, { count: number; size: number }> = {
          images: { count: 0, size: 0 },
          videos: { count: 0, size: 0 },
          audio: { count: 0, size: 0 },
          documents: { count: 0, size: 0 },
          archives: { count: 0, size: 0 },
          others: { count: 0, size: 0 },
        };

        const parsedFiles = appFiles.map((msg: any) => {
          let size = 0;
          let mime = '';
          let ext = '';

          if (msg.media.document) {
            size = msg.media.document.size || 0;
            mime = msg.media.document.mimeType || '';
          } else if (msg.media.photo) {
            mime = 'image/jpeg';
            if (msg.media.photo.sizes) {
              const largest = msg.media.photo.sizes[msg.media.photo.sizes.length - 1];
              size = largest.size || 300000;
            }
          }

          const rawName = msg.message ? msg.message.split('_')[0] : 'Unnamed';
          const parts = rawName.split('.');
          if (parts.length > 1) {
            ext = parts[parts.length - 1].toLowerCase();
          }

          let cat = 'others';
          if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            cat = 'images';
          } else if (
            mime.startsWith('video/') ||
            ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)
          ) {
            cat = 'videos';
          } else if (
            mime.startsWith('audio/') ||
            ['mp3', 'wav', 'flac', 'ogg', 'm4a'].includes(ext)
          ) {
            cat = 'audio';
          } else if (
            mime.includes('pdf') ||
            mime.includes('text') ||
            mime.includes('document') ||
            ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'].includes(ext)
          ) {
            cat = 'documents';
          } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            cat = 'archives';
          }

          categories[cat].count += 1;
          categories[cat].size += size;
          totalSize += size;

          return { name: rawName, size, category: cat };
        });

        const largestFiles = [...parsedFiles].sort((a, b) => b.size - a.size).slice(0, 5);

        setStats({
          totalFiles: parsedFiles.length,
          totalSize,
          categories,
          largestFiles,
        });
      } catch (err: any) {
        console.error('Analytics error:', err);
        setError(err.message || 'Failed to parse drive details.');
      } finally {
        setLoading(false);
      }
    };

    scan();

    return () => {
      active = false;
    };
  }, [visible, selectedChatId]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="pie-chart-outline" size={20} color={Colors.dark.primaryLight} />
              </View>
              <View>
                <Text style={styles.title}>Drive Analytics</Text>
                <Text style={styles.subtitle}>Unmetered cloud storage node</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.dark.primary} />
                <Text style={styles.loadingText}>Analyzing drive storage...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={40} color={Colors.dark.errorLight} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : stats ? (
              <View style={styles.statsContainer}>
                {/* 3 Metric Cards */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>USED</Text>
                    <Text style={styles.metricValue}>{formatBytes(stats.totalSize)}</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>FOLDERS</Text>
                    <Text style={styles.metricValue}>{foldersCount}</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabel}>FILES</Text>
                    <Text style={styles.metricValue}>{stats.totalFiles}</Text>
                  </View>
                </View>

                {/* Progress bar distribution */}
                <Text style={styles.sectionTitle}>STORAGE DISTRIBUTION</Text>
                <View style={styles.progressBar}>
                  {Object.entries(stats.categories).map(([key, cat]) => {
                    const pct = stats.totalSize > 0 ? (cat.size / stats.totalSize) * 100 : 0;
                    if (pct === 0) return null;
                    return (
                      <View
                        key={key}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: categoryConfig[key].color,
                          height: '100%',
                        }}
                      />
                    );
                  })}
                </View>

                {/* Category Grid */}
                <View style={styles.categoryGrid}>
                  {Object.entries(stats.categories).map(([key, cat]) => {
                    const cfg = categoryConfig[key];
                    return (
                      <View key={key} style={styles.categoryCard}>
                        <View style={styles.categoryHeader}>
                          <View
                            style={[
                              styles.catDot,
                              { backgroundColor: cfg.color },
                            ]}
                          />
                          <Text style={styles.catLabel}>{cfg.label}</Text>
                        </View>
                        <Text style={styles.catSize}>{formatBytes(cat.size)}</Text>
                        <Text style={styles.catCount}>{cat.count} files</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Largest Files */}
                {stats.largestFiles.length > 0 && (
                  <View style={styles.largestSection}>
                    <Text style={styles.sectionTitle}>LARGEST FILES</Text>
                    {stats.largestFiles.map((file, i) => (
                      <View key={i} style={styles.fileRow}>
                        <Ionicons
                          name={categoryConfig[file.category]?.icon || 'document'}
                          size={18}
                          color={categoryConfig[file.category]?.color || Colors.dark.primaryLight}
                        />
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <Text style={styles.fileSize}>{formatBytes(file.size)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity style={styles.closePanelBtn} onPress={onClose}>
            <Text style={styles.closePanelText}>Close Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.dark.surface2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 16,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  errorText: {
    color: Colors.dark.errorLight,
    fontSize: 13,
    textAlign: 'center',
  },
  statsContainer: {
    gap: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    letterSpacing: 0.8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    padding: 10,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  catSize: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  catCount: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  largestSection: {
    gap: 8,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 10,
    padding: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  fileSize: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  closePanelBtn: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closePanelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
