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
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/theme';
import { Header } from '@/components/Header';
import { FileCard } from '@/components/FileCard';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import {
  getConnectedClient,
  downloadAndShareFile,
  uploadFileToTelegram,
} from '@/services/telegramApi';
import { getStoredAuth } from '@/services/storage';

export default function FolderFilesScreen() {
  const router = useRouter();
  const { chatId, chatName, folderId, folderName } = useLocalSearchParams<{
    chatId: string;
    chatName?: string;
    folderId: string;
    folderName?: string;
  }>();

  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Download & Upload States
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Delete States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const getCleanFileName = useCallback((msg: any): string => {
    if (!msg) return 'Unnamed File';
    const text = (msg.message || '').trim();

    if (folderId && folderId !== 'uncategorised') {
      const suffix = `_${folderId}`;
      if (text.endsWith(suffix)) {
        return text.substring(0, text.length - suffix.length).trim() || 'Unnamed File';
      }
    }

    const lastUnderscore = text.lastIndexOf('_');
    if (lastUnderscore !== -1) {
      const potentialUid = text.substring(lastUnderscore + 1).trim();
      if (/^\d{6}$/.test(potentialUid)) {
        return text.substring(0, lastUnderscore).trim() || 'Unnamed File';
      }
    }

    if (!text && msg.media?.document?.attributes) {
      const fileAttr = msg.media.document.attributes.find(
        (attr: any) => attr.className === 'DocumentAttributeFilename' || attr.fileName
      );
      if (fileAttr && fileAttr.fileName) return fileAttr.fileName;
    }

    return text || 'Unnamed File';
  }, [folderId]);

  const fetchFiles = useCallback(async () => {
    if (!chatId || !folderId) return;

    try {
      setLoading(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) {
        router.replace('/login');
        return;
      }

      const client = await getConnectedClient(apiId, apiHash, token);
      const entityStr = chatId;

      let allMessages: any[] = [];
      if (folderId === 'uncategorised') {
        allMessages = await client.getMessages(entityStr, { limit: 500 });
      } else {
        const suffix = `_${folderId}`;
        const [searchHistory, recentHistory] = await Promise.all([
          client.getMessages(entityStr, { limit: 1000, search: suffix }),
          client.getMessages(entityStr, { limit: 200 }),
        ]);
        allMessages = [...recentHistory, ...searchHistory];
      }

      const uniqueMap = new Map();
      allMessages.forEach((msg: any) => {
        if (msg && !uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
      });

      let filtered: any[] = [];
      if (folderId === 'uncategorised') {
        filtered = Array.from(uniqueMap.values()).filter((msg: any) => {
          if (!msg.media) return false;
          if (msg.message && msg.message.includes('###_UNLIMITED_STORAGE_INDEX_###')) return false;
          return true;
        });
      } else {
        const suffix = `_${folderId}`;
        filtered = Array.from(uniqueMap.values()).filter(
          (msg: any) => msg.message && msg.message.trim().endsWith(suffix) && msg.media
        );
      }

      setFiles(filtered);
    } catch (err: any) {
      console.error('Fetch files error:', err);
      Alert.alert('Error', err.message || 'Failed to load folder files.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId, folderId, router]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFiles();
  };

  const handlePickAndUpload = async () => {
    if (!chatId) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*',
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      setIsUploading(true);
      setUploadProgress(0);

      const client = await getConnectedClient(apiId, apiHash, token);
      await uploadFileToTelegram(
        client,
        chatId,
        asset.uri,
        asset.name,
        folderId,
        (progress) => setUploadProgress(progress)
      );

      setIsUploading(false);
      fetchFiles();
    } catch (err: any) {
      setIsUploading(false);
      console.error('Upload error:', err);
      Alert.alert('Upload Failed', err.message || 'Could not upload file to Telegram.');
    }
  };

  const handleDownload = async (msg: any) => {
    try {
      setDownloadingId(msg.id);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      const client = await getConnectedClient(apiId, apiHash, token);
      const cleanName = getCleanFileName(msg);
      await downloadAndShareFile(client, msg, cleanName);
    } catch (err: any) {
      Alert.alert('Download Error', err.message || 'Failed to download file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteFile = async () => {
    if (!chatId || !fileToDelete) return;
    try {
      setIsDeleting(true);
      const { apiId, apiHash, token } = await getStoredAuth();
      if (!apiId || !apiHash || !token) return;

      const client = await getConnectedClient(apiId, apiHash, token);
      await client.deleteMessages(chatId, [fileToDelete.id], { revoke: true });

      setIsDeleteOpen(false);
      setFileToDelete(null);
      fetchFiles();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete file.');
    } finally {
      setIsDeleting(false);
    }
  };

  const processedFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((f) => getCleanFileName(f).toLowerCase().includes(q));
    }

    return result.sort((a, b) => {
      if (sortBy === 'name') {
        const na = getCleanFileName(a).toLowerCase();
        const nb = getCleanFileName(b).toLowerCase();
        return sortOrder === 'asc' ? na.localeCompare(nb) : nb.localeCompare(na);
      }
      if (sortBy === 'date') {
        return sortOrder === 'asc' ? (a.date || 0) - (b.date || 0) : (b.date || 0) - (a.date || 0);
      }
      if (sortBy === 'size') {
        const sa = a.media?.document?.size || 0;
        const sb = b.media?.document?.size || 0;
        return sortOrder === 'asc' ? sa - sb : sb - sa;
      }
      return 0;
    });
  }, [files, searchQuery, sortBy, sortOrder, getCleanFileName]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={folderName ? decodeURIComponent(folderName) : 'Files'}
        subtitle={chatName ? decodeURIComponent(chatName) : 'Drive Storage'}
        showBack
        onBack={() => router.back()}
        rightAction={{
          icon: 'cloud-upload',
          onPress: handlePickAndUpload,
          color: Colors.dark.primaryLight,
        }}
      />

      <View style={styles.container}>
        {/* Upload Status Card */}
        {isUploading && (
          <View style={styles.uploadCard}>
            <View style={styles.uploadRow}>
              <ActivityIndicator size="small" color={Colors.dark.primaryLight} />
              <Text style={styles.uploadText}>
                Uploading to Telegram... {uploadProgress}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
          </View>
        )}

        {/* Toolbar: Search & Sort */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color={Colors.dark.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search files..."
              placeholderTextColor={Colors.dark.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={Colors.dark.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Toggle */}
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => {
              if (sortBy === 'date') setSortBy('name');
              else if (sortBy === 'name') setSortBy('size');
              else setSortBy('date');
            }}
          >
            <Ionicons name="swap-vertical" size={16} color={Colors.dark.primaryLight} />
            <Text style={styles.sortBtnText}>{sortBy.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Files List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
            <Text style={styles.loadingText}>Fetching files from Telegram MTProto...</Text>
          </View>
        ) : (
          <FlatList
            data={processedFiles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <FileCard
                message={item}
                displayName={getCleanFileName(item)}
                isDownloading={downloadingId === item.id}
                onDownload={() => handleDownload(item)}
                onDelete={() => {
                  setFileToDelete(item);
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
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="documents-outline" size={44} color={Colors.dark.textMuted} />
                <Text style={styles.emptyTitle}>No files in this folder</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the upload button above to save photos, videos, or documents.
                </Text>
                <TouchableOpacity
                  style={styles.emptyUploadBtn}
                  onPress={handlePickAndUpload}
                  activeOpacity={0.8}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                  <Text style={styles.emptyUploadBtnText}>Upload First File</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Delete Modal */}
      <DeleteConfirmModal
        visible={isDeleteOpen}
        title="Delete File"
        message={`Are you sure you want to delete "${fileToDelete ? getCleanFileName(fileToDelete) : 'this file'}"? The message will be revoked from Telegram.`}
        loading={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setFileToDelete(null);
        }}
        onConfirm={handleDeleteFile}
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
  uploadCard: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 10,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.primaryLight,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.text,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.dark.surface2,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.primaryLight,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 16,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    marginTop: 6,
  },
  emptyUploadBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
