/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { getConnectedClient } from '@/services/telegramApi';
import { getStoredAuth, getStorageItem, StorageKeys } from '@/services/storage';
import { formatBytes } from '@/services/folderManager';

export default function GlobalAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeChatName, setActiveChatName] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalFiles: number;
    totalSize: number;
    dialogsCount: number;
    categories: Record<string, { count: number; size: number }>;
  } | null>(null);

  const loadData = async () => {
    try {
      const { apiId, apiHash, token } = await getStoredAuth();
      const chatName = await getStorageItem(StorageKeys.SELECTED_CHAT_NAME);
      const chatId = await getStorageItem(StorageKeys.SELECTED_CHAT_ID);
      setActiveChatName(chatName ? decodeURIComponent(chatName) : null);

      if (!apiId || !apiHash || !token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const client = await getConnectedClient(apiId, apiHash, token);
      const dialogs = await client.getDialogs({});

      let totalFiles = 0;
      let totalSize = 0;
      const categories: Record<string, { count: number; size: number }> = {
        images: { count: 0, size: 0 },
        videos: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        documents: { count: 0, size: 0 },
        archives: { count: 0, size: 0 },
        others: { count: 0, size: 0 },
      };

      // If a chat is selected, inspect that chat
      if (chatId) {
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(chatId, { limit: 500, search: '_' }),
          client.getMessages(chatId, { limit: 200 }),
        ]);

        const uniqueMap = new Map();
        [...recentHistory, ...searchHistory].forEach((msg: any) => {
          if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
        });

        Array.from(uniqueMap.values()).forEach((msg: any) => {
          if (!msg.media) return;
          const text = (msg.message || '').trim();
          if (!/_\d{6}$/.test(text)) return;

          let size = 0;
          let mime = '';
          let ext = '';

          if (msg.media.document) {
            size = msg.media.document.size || 0;
            mime = msg.media.document.mimeType || '';
          } else if (msg.media.photo) {
            mime = 'image/jpeg';
            size = 300000;
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
          totalFiles += 1;
          totalSize += size;
        });
      }

      setStats({
        totalFiles,
        totalSize,
        dialogsCount: dialogs.length,
        categories,
      });
    } catch (e) {
      console.warn('Analytics loading error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Storage Analytics</Text>
        <Text style={styles.headerSubtitle}>
          {activeChatName ? `Active: ${activeChatName}` : 'Unmetered Telegram Cloud'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.primaryLight}
          />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Compiling storage analytics...</Text>
          </View>
        ) : stats ? (
          <View style={styles.statsContainer}>
            {/* 3 Metric Cards */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Ionicons name="infinite" size={20} color={Colors.dark.emeraldLight} />
                <Text style={styles.metricLabel}>CAPACITY</Text>
                <Text style={styles.metricValue}>Unlimited</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="pie-chart" size={20} color={Colors.dark.primaryLight} />
                <Text style={styles.metricLabel}>USED</Text>
                <Text style={styles.metricValue}>{formatBytes(stats.totalSize)}</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="chatbubbles" size={20} color={Colors.dark.violet} />
                <Text style={styles.metricLabel}>DIALOGUES</Text>
                <Text style={styles.metricValue}>{stats.dialogsCount}</Text>
              </View>
            </View>

            {/* Storage Distribution */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Category Distribution</Text>
              <View style={styles.progressBar}>
                {Object.entries(stats.categories).map(([key, cat]) => {
                  const colors: Record<string, string> = {
                    images: '#10B981',
                    videos: '#8B5CF6',
                    audio: '#EC4899',
                    documents: '#3B82F6',
                    archives: '#F59E0B',
                    others: '#64748B',
                  };
                  const pct = stats.totalSize > 0 ? (cat.size / stats.totalSize) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <View
                      key={key}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[key],
                        height: '100%',
                      }}
                    />
                  );
                })}
              </View>

              <View style={styles.catGrid}>
                {Object.entries(stats.categories).map(([key, cat]) => {
                  const colors: Record<string, string> = {
                    images: '#10B981',
                    videos: '#8B5CF6',
                    audio: '#EC4899',
                    documents: '#3B82F6',
                    archives: '#F59E0B',
                    others: '#64748B',
                  };
                  return (
                    <View key={key} style={styles.catItem}>
                      <View style={[styles.catDot, { backgroundColor: colors[key] }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.catName}>{key.toUpperCase()}</Text>
                        <Text style={styles.catMeta}>{formatBytes(cat.size)} ({cat.count})</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Architecture Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Security & Privacy Model</Text>
              <View style={styles.featureRow}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.dark.emeraldLight} />
                <Text style={styles.featureText}>Direct MTProto TLS Handshake</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="phone-portrait-outline" size={18} color={Colors.dark.primaryLight} />
                <Text style={styles.featureText}>Keys saved locally on device only</Text>
              </View>
              <View style={styles.featureRow}>
                <Ionicons name="speedometer-outline" size={18} color={Colors.dark.violet} />
                <Text style={styles.featureText}>No bandwidth throttling or quotas</Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.dark.surface1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  statsContainer: {
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  catItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 8,
    borderRadius: 10,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  catMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
