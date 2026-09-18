import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { UploadCloud, Image, FileText, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { getConnectedClient } from '../../services/telegramApi';
import { storageService } from '../../services/storageService';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatBytes } from '../../utils/fileTypes';
import { Buffer } from 'buffer';

interface UploadModalProps {
  visible: boolean;
  selectedChatId: string;
  currentFolderUid?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  selectedChatId,
  currentFolderUid,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [mode, setMode] = useState<'picker' | 'textNote'>('picker');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const resetState = () => {
    setSelectedFile(null);
    setNoteTitle('');
    setNoteContent('');
    setMode('picker');
    setUploading(false);
    setProgress(0);
    setStatusMsg('');
    setError('');
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*',
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        });
        setError('');
      }
    } catch (err: any) {
      setError('Error picking document: ' + err.message);
    }
  };

  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 1,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        const fileName = asset.fileName || (asset.type === 'video' ? `video_${Date.now()}.mp4` : `photo_${Date.now()}.jpg`);
        setSelectedFile({
          uri: asset.uri,
          name: fileName,
          size: asset.fileSize,
          mimeType: asset.mimeType,
        });
        setError('');
      }
    } catch (err: any) {
      setError('Error picking media: ' + err.message);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      setError('');
      setStatusMsg('Preparing upload...');
      setProgress(0.1);

      const { apiId, apiHash, token } = await storageService.getAuthCredentials();
      if (!apiId || !apiHash || !token) throw new Error('Missing MTProto session');

      const client = await getConnectedClient(apiId, apiHash, token);
      const suffix = currentFolderUid && currentFolderUid !== 'uncategorised' ? `_${currentFolderUid}` : '';

      if (mode === 'textNote') {
        if (!noteTitle.trim()) {
          setError('Please provide a file name for the note');
          setUploading(false);
          return;
        }

        const fileName = noteTitle.endsWith('.txt') ? noteTitle : `${noteTitle}.txt`;
        const caption = `${fileName}${suffix}`;

        setStatusMsg('Uploading note to Telegram...');
        const buffer = Buffer.from(noteContent, 'utf-8');

        // Send text file via GramJS custom file upload
        const { CustomFile } = require('telegram/client/uploads');
        const toUpload = new CustomFile(fileName, buffer.length, '', buffer);

        await client.sendFile(selectedChatId, {
          file: toUpload,
          caption,
          progressCallback: (p: any) => setProgress(Number(p)),
        });
      } else if (selectedFile) {
        setStatusMsg('Reading file...');
        const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const buffer = Buffer.from(base64Data, 'base64');

        const caption = `${selectedFile.name}${suffix}`;
        setStatusMsg('Uploading file chunks...');

        const { CustomFile } = require('telegram/client/uploads');
        const toUpload = new CustomFile(selectedFile.name, buffer.length, '', buffer);

        await client.sendFile(selectedChatId, {
          file: toUpload,
          caption,
          progressCallback: (p: any) => setProgress(Number(p)),
        });
      }

      setStatusMsg('Upload complete!');
      setProgress(1);
      setTimeout(() => {
        resetState();
        onClose();
        onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <GlassCard style={styles.modalContent} variant="glow">
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.iconBox}>
                    <UploadCloud size={20} color="#38bdf8" />
                  </View>
                  <Text style={styles.title}>Upload to Drive</Text>
                </View>
                <Button
                  title=""
                  variant="ghost"
                  size="sm"
                  icon={<X size={20} color="#94a3b8" />}
                  onPress={onClose}
                  disabled={uploading}
                />
              </View>

              {/* Mode switch tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'picker' && styles.activeTab]}
                  onPress={() => setMode('picker')}
                  disabled={uploading}
                >
                  <Text style={[styles.tabText, mode === 'picker' && styles.activeTabText]}>
                    Upload Files
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === 'textNote' && styles.activeTab]}
                  onPress={() => setMode('textNote')}
                  disabled={uploading}
                >
                  <Text style={[styles.tabText, mode === 'textNote' && styles.activeTabText]}>
                    Create Note (.txt)
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === 'picker' ? (
                <View style={styles.pickerSection}>
                  {!selectedFile ? (
                    <View style={styles.pickerButtons}>
                      <TouchableOpacity
                        style={styles.pickCard}
                        onPress={handlePickDocument}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.cardIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                          <FileText size={24} color="#38bdf8" />
                        </View>
                        <Text style={styles.cardTitle}>Browse Files</Text>
                        <Text style={styles.cardSubtitle}>PDF, Docs, Zip, Code</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.pickCard}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.cardIcon, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                          <Image size={24} color="#a855f7" />
                        </View>
                        <Text style={styles.cardTitle}>Photos & Videos</Text>
                        <Text style={styles.cardSubtitle}>Gallery media</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.selectedFileBox}>
                      <View style={styles.fileInfo}>
                        <CheckCircle size={20} color="#10b981" />
                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={styles.selectedFileName} numberOfLines={1}>
                            {selectedFile.name}
                          </Text>
                          {selectedFile.size ? (
                            <Text style={styles.selectedFileSize}>
                              {formatBytes(selectedFile.size)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {!uploading && (
                        <TouchableOpacity onPress={() => setSelectedFile(null)}>
                          <X size={18} color="#94a3b8" />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noteSection}>
                  <Input
                    label="File Name"
                    placeholder="e.g., meeting-notes.txt"
                    value={noteTitle}
                    onChangeText={setNoteTitle}
                    disabled={uploading}
                  />
                  <Input
                    label="Text Content"
                    placeholder="Type or paste your note content here..."
                    value={noteContent}
                    onChangeText={setNoteContent}
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                    disabled={uploading}
                  />
                </View>
              )}

              {/* Uploading progress indicator */}
              {uploading && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
                  </View>
                  <Text style={styles.statusText}>
                    {statusMsg} ({Math.round(progress * 100)}%)
                  </Text>
                </View>
              )}

              {error ? (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={onClose}
                  disabled={uploading}
                />
                <Button
                  title="Upload Now"
                  variant="primary"
                  onPress={handleUpload}
                  loading={uploading}
                  disabled={mode === 'picker' ? !selectedFile : !noteTitle.trim()}
                  style={styles.uploadBtn}
                />
              </View>
            </GlassCard>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  pickerSection: {
    marginBottom: 16,
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  pickCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    padding: 12,
    borderRadius: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedFileName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedFileSize: {
    color: '#a7f3d0',
    fontSize: 11,
    marginTop: 2,
  },
  noteSection: {
    marginBottom: 12,
  },
  progressContainer: {
    marginVertical: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38bdf8',
    borderRadius: 3,
  },
  statusText: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  uploadBtn: {
    minWidth: 120,
  },
});
