/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { FolderCard } from '@/components/FolderCard';
import { CreateFolderModal } from '@/components/CreateFolderModal';
import { RenameFolderModal } from '@/components/RenameFolderModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { StorageAnalyticsModal } from '@/components/StorageAnalyticsModal';
import { getConnectedClient } from '@/services/telegramApi';
import { getStoredAuth } from '@/services/storage';
import {
  parseFolderLine,
  fetchAllIndexMessages,
  createFolderNode,
  renameFolderNode,
  deleteFolderNode,
  FolderNode,
} from '@/services/folderManager';

export default function DriveFolderScreen() {
  const router = useRouter();
  const { chatId, chatName } = useLocalSearchParams<{ chatId: string; chatName?: string }>();

  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<FolderNode | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<FolderNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!chatId) return;

    try {
      setLoading(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) {
        router.replace('/login');
        return;
      }

      const client = await getConnectedClient(apiId, apiHash, token);
      const entityStr = chatId;

      const [searchHistory, recentHistory] = await Promise.all([
        fetchAllIndexMessages(client, entityStr),
        client.getMessages(entityStr, { limit: 100 }),
      ]);

      const allIndexes = [...recentHistory, ...searchHistory].filter(
        (m: any) => m.message && m.message.includes('###_UNLIMITED_STORAGE_INDEX_###')
      );

      const uncategorisedFolder: FolderNode = {
        id: 'uncategorised',
        message: 'uncategorised',
        uid: 'uncategorised',
        name: 'Uncategorised Files',
        date: Math.floor(Date.now() / 1000),
      };

      if (allIndexes.length > 0) {
        const uniqueLineSet = new Set<string>();
        let newestDate = 0;
        let baseId = 0;

        allIndexes.forEach((indexMsg: any) => {
          const lines = indexMsg.message.split('\n');
          lines.forEach((line: string) => {
            const trimmed = line.trim();
            if (trimmed) uniqueLineSet.add(trimmed);
          });
          if (indexMsg.date > newestDate) {
            newestDate = indexMsg.date;
            baseId = indexMsg.id;
          }
        });

        const parsedList = Array.from(uniqueLineSet)
          .map((line: string) => {
            const parsed = parseFolderLine(line);
            if (!parsed) return null;
            return { ...parsed, raw: line };
          })
          .filter(Boolean)
          .map((folder: any, idx: number) => ({
            id: baseId * 10000 + idx,
            message: folder.raw,
            uid: folder.uid,
            name: folder.name,
            date: newestDate,
          }))
          .reverse();

        setFolders([uncategorisedFolder, ...parsedList]);
      } else {
        setFolders([uncategorisedFolder]);
      }
    } catch (err: any) {
      console.error('Fetch folders error:', err);
      Alert.alert('Error', err.message || 'Failed to load drive folders.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId, router]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFolders();
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!chatId) return;
    try {
      setIsCreating(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      const client = await getConnectedClient(apiId, apiHash, token);
      await createFolderNode(client, chatId, folderName);
      setIsCreateOpen(false);
      fetchFolders();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create folder.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameFolder = async (newName: string) => {
    if (!chatId || !folderToRename) return;
    try {
      setIsRenaming(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      const client = await getConnectedClient(apiId, apiHash, token);
      await renameFolderNode(client, chatId, folderToRename, newName);
      setIsRenameOpen(false);
      setFolderToRename(null);
      fetchFolders();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to rename folder.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!chatId || !folderToDelete) return;
    try {
      setIsDeleting(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      const client = await getConnectedClient(apiId, apiHash, token);
      await deleteFolderNode(client, chatId, folderToDelete.uid);
      setIsDeleteOpen(false);
      setFolderToDelete(null);
      fetchFolders();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete folder.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    const q = searchQuery.toLowerCase().trim();
    return folders.filter(
      (f) => f.name.toLowerCase().includes(q) || f.uid.toLowerCase().includes(q)
    );
  }, [folders, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={chatName ? decodeURIComponent(chatName) : 'Cloud Drive'}
        subtitle="Virtual Folder Directory"
        showBack
        onBack={() => router.back()}
        rightAction={{
          icon: 'pie-chart-outline',
          onPress: () => setIsAnalyticsOpen(true),
        }}
      />

      <View style={styles.container}>
        {/* Action Header */}
        <View style={styles.actionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Drive Folders</Text>
            <Text style={styles.sectionSubtitle}>
              {folders.length} {folders.length === 1 ? 'folder' : 'folders'} organized
            </Text>
          </View>

          <TouchableOpacity
            style={styles.newFolderBtn}
            onPress={() => setIsCreateOpen(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.newFolderBtnText}>New Folder</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={17} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search folders by name or UID..."
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

        {/* Folders List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Syncing virtual directories...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredFolders}
            keyExtractor={(item) => item.uid}
            renderItem={({ item }) => (
              <FolderCard
                folder={item}
                onPress={() =>
                  router.push({
                    pathname: '/drive/[chatId]/folder/[folderId]',
                    params: {
                      chatId: chatId!,
                      chatName: chatName || '',
                      folderId: item.uid,
                      folderName: item.name,
                    },
                  })
                }
                onRename={() => {
                  setFolderToRename(item);
                  setIsRenameOpen(true);
                }}
                onDelete={() => {
                  setFolderToDelete(item);
                  setIsDeleteOpen(true);
                }}
              />
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
          />
        )}
      </View>

      {/* Modals */}
      <CreateFolderModal
        visible={isCreateOpen}
        loading={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateFolder}
      />

      <RenameFolderModal
        visible={isRenameOpen}
        folder={folderToRename}
        loading={isRenaming}
        onClose={() => {
          setIsRenameOpen(false);
          setFolderToRename(null);
        }}
        onRename={handleRenameFolder}
      />

      <DeleteConfirmModal
        visible={isDeleteOpen}
        title="Delete Folder"
        message={`Are you sure you want to delete "${folderToDelete?.name}"? The virtual folder will be removed from the Master Index.`}
        loading={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setFolderToDelete(null);
        }}
        onConfirm={handleDeleteFolder}
      />

      <StorageAnalyticsModal
        visible={isAnalyticsOpen}
        selectedChatId={chatId || ''}
        foldersCount={folders.length}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  newFolderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newFolderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
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
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.text,
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
    paddingBottom: 30,
  },
});
