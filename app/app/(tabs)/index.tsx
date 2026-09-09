/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { getConnectedClient, disconnectActiveClient } from '@/services/telegramApi';
import {
  getStoredAuth,
  setStorageItem,
  clearSessionStorage,
  StorageKeys,
} from '@/services/storage';
import { DriveCard, ChatItem } from '@/components/DriveCard';
import { SetupGuideModal } from '@/components/SetupGuideModal';

export default function DrivesScreen() {
  const router = useRouter();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'channels' | 'groups' | 'private'>('all');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      setErrorMsg('');
      const { apiId, apiHash, token } = await getStoredAuth();

      if (!apiId || !apiHash || !token) {
        router.replace('/login');
        return;
      }

      const client = await getConnectedClient(apiId, apiHash, token);
      const dialogs = await client.getDialogs({});

      const mapped: ChatItem[] = dialogs.map((d: any) => ({
        id: d.id ? d.id.toString() : Math.random().toString(),
        name: d.name || d.title || 'Unnamed Chat',
        isChannel: d.isChannel || false,
        isGroup: d.isGroup || false,
      }));

      setChats(mapped);
    } catch (err: any) {
      console.error('Fetch chats error:', err);
      setErrorMsg(err.message || 'Failed to connect to Telegram or fetch dialogues.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChats();
  };

  const handleSelectChat = async (chat: ChatItem) => {
    await setStorageItem(StorageKeys.SELECTED_CHAT_ID, chat.id);
    await setStorageItem(StorageKeys.SELECTED_CHAT_NAME, chat.name);
    router.push({
      pathname: '/drive/[chatId]',
      params: { chatId: chat.id, chatName: chat.name },
    });
  };

  const handleLogout = async () => {
    await disconnectActiveClient();
    await clearSessionStorage();
    router.replace('/login');
  };

  // Filtered & Searched Chats
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!chat.name.toLowerCase().includes(query)) return false;
      }

      // Filter tab
      if (activeFilter === 'channels') return chat.isChannel;
      if (activeFilter === 'groups') return chat.isGroup;
      if (activeFilter === 'private') return !chat.isChannel && !chat.isGroup;

      return true;
    });
  }, [chats, searchQuery, activeFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="cloud" size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>NexGenStorage</Text>
            <Text style={styles.headerSubtitle}>Direct MTProto Cloud</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.guideBtn}
            onPress={() => setIsGuideOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 13 }}>💡</Text>
            <Text style={styles.guideBtnText}>Guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={Colors.dark.errorLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Body */}
      <View style={styles.container}>
        {/* Title & Stats Row */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>Select a Drive</Text>
            <Text style={styles.screenSubtitle}>
              {chats.length} dialogues available as cloud storage nodes
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={17} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search channels, groups, chats..."
            placeholderTextColor={Colors.dark.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={17} color={Colors.dark.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'channels', 'groups', 'private'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Error State */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={Colors.dark.errorLight} />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchChats}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Dialogues List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Loading Telegram drives...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DriveCard chat={item} onPress={() => handleSelectChat(item)} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.dark.primaryLight}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cloud-offline-outline" size={44} color={Colors.dark.textMuted} />
                <Text style={styles.emptyTitle}>No drives found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery ? 'Try matching another name' : 'Create a private group or channel in Telegram'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* Setup Guide Modal */}
      <SetupGuideModal visible={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.dark.surface1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.dark.primaryLight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  guideBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  titleRow: {
    marginBottom: 14,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primaryLight,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFF',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: Colors.dark.errorLight,
    fontSize: 12,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.dark.error,
  },
  retryBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
});
