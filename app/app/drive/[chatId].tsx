import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Search,
  Grid,
  List,
  FolderPlus,
  Upload,
  PieChart,
  Folder,
} from 'lucide-react-native';
import { AmbientBackground } from '../../src/components/common/AmbientBackground';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { FolderCard } from '../../src/components/drive/FolderCard';
import { FileCard } from '../../src/components/drive/FileCard';
import { StorageBreadcrumbs } from '../../src/components/drive/StorageBreadcrumbs';
import { CreateFolderModal } from '../../src/components/modals/CreateFolderModal';
import { RenameFolderModal } from '../../src/components/modals/RenameFolderModal';
import { DeleteConfirmModal } from '../../src/components/modals/DeleteConfirmModal';
import { UploadModal } from '../../src/components/modals/UploadModal';
import { FileViewerModal } from '../../src/components/modals/FileViewerModal';
import { StorageAnalyticsModal } from '../../src/components/modals/StorageAnalyticsModal';
import { useDriveFiles, TelegramFileItem } from '../../src/hooks/useDriveFiles';
import {
  FolderNode,
  createFolderNode,
  renameFolderNode,
  deleteFolderNode,
  deleteFolderFiles,
} from '../../src/services/folderManager';
import { getConnectedClient } from '../../src/services/telegramApi';
import { storageService } from '../../src/services/storageService';

export default function DriveExplorerScreen() {
  const router = useRouter();
  const { chatId, chatName } = useLocalSearchParams<{ chatId: string; chatName?: string }>();

  // State
  const [currentFolder, setCurrentFolder] = useState<FolderNode | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [renameFolderTarget, setRenameFolderTarget] = useState<FolderNode | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<FolderNode | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerFile, setViewerFile] = useState<TelegramFileItem | null>(null);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);

  // Custom hook for drive files & index manifesto
  const { folders, allFiles, loading, error, refresh } = useDriveFiles(chatId || null);

  // Filtered files for current view
  const visibleFiles = useMemo(() => {
    let files = allFiles;
    if (currentFolder) {
      files = files.filter((f) => f.folderUid === currentFolder.uid);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      files = files.filter((f) => f.fileName?.toLowerCase().includes(q));
    }
    return files;
  }, [allFiles, currentFolder, searchQuery]);

  // Filtered folders
  const visibleFolders = useMemo(() => {
    if (currentFolder) return []; // Nested folders currently flat in Master Index
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return folders.filter((f) => f.name.toLowerCase().includes(q));
    }
    return folders;
  }, [folders, currentFolder, searchQuery]);

  // File count per folder map
  const folderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    allFiles.forEach((file) => {
      const uid = file.folderUid || 'uncategorised';
      map[uid] = (map[uid] || 0) + 1;
    });
    return map;
  }, [allFiles]);

  // Actions
  const handleCreateFolder = async (folderName: string) => {
    const { apiId, apiHash, token } = await storageService.getAuthCredentials();
    if (!apiId || !apiHash || !token || !chatId) return;
    const client = await getConnectedClient(apiId, apiHash, token);
    await createFolderNode(client, chatId, folderName);
    refresh();
  };

  const handleRenameFolder = async (folder: FolderNode, newName: string) => {
    const { apiId, apiHash, token } = await storageService.getAuthCredentials();
    if (!apiId || !apiHash || !token || !chatId) return;
    const client = await getConnectedClient(apiId, apiHash, token);
    await renameFolderNode(client, chatId, folder, newName);
    refresh();
  };

  const handleDeleteFolder = async (folder: FolderNode, recursive: boolean) => {
    const { apiId, apiHash, token } = await storageService.getAuthCredentials();
    if (!apiId || !apiHash || !token || !chatId) return;
    const client = await getConnectedClient(apiId, apiHash, token);

    await deleteFolderNode(client, chatId, folder.uid);
    if (recursive) {
      await deleteFolderFiles(client, chatId, folder.uid);
    }
    if (currentFolder?.uid === folder.uid) {
      setCurrentFolder(null);
    }
    refresh();
  };

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
              <ChevronLeft size={22} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.titleBox}>
              <Text style={styles.driveTitle} numberOfLines={1}>
                {chatName || 'Cloud Drive'}
              </Text>
              <Text style={styles.driveSub}>
                {folders.length} folders • {allFiles.length} files
              </Text>
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                onPress={() => setAnalyticsModalOpen(true)}
                style={styles.iconBtn}
              >
                <PieChart size={18} color="#818cf8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                style={styles.iconBtn}
              >
                {viewMode === 'grid' ? (
                  <List size={18} color="#94a3b8" />
                ) : (
                  <Grid size={18} color="#94a3b8" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Breadcrumbs */}
          <StorageBreadcrumbs
            chatName={chatName || 'Drive Root'}
            currentFolder={currentFolder}
            onNavigateRoot={() => setCurrentFolder(null)}
          />

          {/* Search bar & Quick Action Bar */}
          <View style={styles.searchRow}>
            <Input
              placeholder="Search in this drive..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={16} color="#64748b" />}
              containerStyle={styles.searchInput}
            />
          </View>

          {/* Action Pills */}
          <View style={styles.actionPills}>
            <TouchableOpacity
              onPress={() => setCreateFolderModalOpen(true)}
              style={styles.pillBtn}
            >
              <FolderPlus size={15} color="#818cf8" />
              <Text style={styles.pillText}>New Folder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setUploadModalOpen(true)}
              style={[styles.pillBtn, styles.uploadPill]}
            >
              <Upload size={15} color="#ffffff" />
              <Text style={[styles.pillText, { color: '#ffffff', fontWeight: '600' }]}>
                Upload
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Content Explorer */}
          {loading && allFiles.length === 0 ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#818cf8" />
              <Text style={styles.loadingText}>Fetching files from Telegram MTProto...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" variant="primary" onPress={refresh} style={{ marginTop: 12 }} />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refresh} tintColor="#818cf8" />
              }
            >
              {/* Virtual Folders Section (Shown only at Root) */}
              {!currentFolder && visibleFolders.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Folders ({visibleFolders.length})</Text>
                  <View style={styles.foldersGrid}>
                    {visibleFolders.map((folder) => (
                      <View key={folder.uid} style={styles.folderWrapper}>
                        <FolderCard
                          folder={folder}
                          fileCount={folderCounts[folder.uid] || 0}
                          onPress={() => setCurrentFolder(folder)}
                          onRename={
                            folder.uid !== 'uncategorised'
                              ? () => setRenameFolderTarget(folder)
                              : undefined
                          }
                          onDelete={
                            folder.uid !== 'uncategorised'
                              ? () => setDeleteFolderTarget(folder)
                              : undefined
                          }
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Files Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {currentFolder ? `Files in ${currentFolder.name}` : 'Recent Files'} (
                  {visibleFiles.length})
                </Text>

                {visibleFiles.length === 0 ? (
                  <View style={styles.emptyFilesBox}>
                    <Folder size={36} color="#334155" />
                    <Text style={styles.emptyFilesText}>No files in this folder</Text>
                    <Button
                      title="Upload Files Here"
                      variant="glass"
                      size="sm"
                      icon={<Upload size={14} color="#818cf8" />}
                      onPress={() => setUploadModalOpen(true)}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                ) : viewMode === 'grid' ? (
                  <View style={styles.filesGrid}>
                    {visibleFiles.map((file) => (
                      <View key={file.id} style={styles.gridFileWrapper}>
                        <FileCard
                          file={file}
                          viewMode="grid"
                          onPress={() => setViewerFile(file)}
                        />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.filesList}>
                    {visibleFiles.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        viewMode="list"
                        onPress={() => setViewerFile(file)}
                      />
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Modals */}
        <CreateFolderModal
          visible={createFolderModalOpen}
          onClose={() => setCreateFolderModalOpen(false)}
          onCreate={handleCreateFolder}
        />

        <RenameFolderModal
          visible={!!renameFolderTarget}
          folder={renameFolderTarget}
          onClose={() => setRenameFolderTarget(null)}
          onRename={handleRenameFolder}
        />

        <DeleteConfirmModal
          visible={!!deleteFolderTarget}
          folder={deleteFolderTarget}
          onClose={() => setDeleteFolderTarget(null)}
          onConfirm={handleDeleteFolder}
        />

        <UploadModal
          visible={uploadModalOpen}
          selectedChatId={chatId || ''}
          currentFolderUid={currentFolder?.uid}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={refresh}
        />

        <FileViewerModal
          visible={!!viewerFile}
          file={viewerFile}
          selectedChatId={chatId || ''}
          onClose={() => setViewerFile(null)}
        />

        <StorageAnalyticsModal
          visible={analyticsModalOpen}
          files={allFiles}
          foldersCount={folders.length}
          onClose={() => setAnalyticsModalOpen(false)}
        />
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  titleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  driveTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
  },
  driveSub: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 1,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchRow: {
    marginVertical: 4,
  },
  searchInput: {
    marginBottom: 8,
  },
  actionPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadPill: {
    backgroundColor: '#6366f1',
    borderColor: '#4f46e5',
  },
  pillText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  foldersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  folderWrapper: {
    width: '50%',
    paddingHorizontal: 4,
  },
  filesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridFileWrapper: {
    width: '50%',
    paddingHorizontal: 4,
  },
  filesList: {
    gap: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyFilesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyFilesText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
  },
});
