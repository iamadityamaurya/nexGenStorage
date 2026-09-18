import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image as RNImage,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
  X,
  Download,
  Share2,
  FileText,
  Video as VideoIcon,
  Music,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';
import { TelegramFileItem } from '../../hooks/useDriveFiles';
import { formatBytes, formatDate, getFileCategory } from '../../utils/fileTypes';
import { storageService } from '../../services/storageService';
import { getConnectedClient } from '../../services/telegramApi';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface FileViewerModalProps {
  visible: boolean;
  file: TelegramFileItem | null;
  selectedChatId: string;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  visible,
  file,
  onClose,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [savedLocallyPath, setSavedLocallyPath] = useState<string | null>(null);

  const category = file ? getFileCategory(file.fileName || '') : null;

  useEffect(() => {
    if (!file || !visible) return;

    let isMounted = true;

    const fetchPreview = async () => {
      try {
        const { apiId, apiHash, token } = await storageService.getAuthCredentials();
        if (!apiId || !apiHash || !token) return;

        const client = await getConnectedClient(apiId, apiHash, token);
        const cat = getFileCategory(file.fileName || '');

        if (cat.category === 'image' || cat.category === 'code' || file.fileName?.endsWith('.txt')) {
          const buffer = await client.downloadMedia(file.media, {
            progressCallback: (p: any) => {
              if (isMounted) setDownloadProgress(Number(p));
            },
          });

          if (!isMounted || !buffer) return;

          if (cat.category === 'image') {
            const base64 = (buffer as any).toString('base64');
            setImageUri(`data:${file.mimeType || 'image/jpeg'};base64,${base64}`);
          } else if (cat.category === 'code' || file.fileName?.endsWith('.txt')) {
            const text = (buffer as any).toString('utf-8');
            setTextContent(text);
          }
        }
      } catch (err: any) {
        console.warn('Preview error:', err);
      }
    };

    fetchPreview();

    return () => {
      isMounted = false;
    };
  }, [file, visible]);

  const handleClose = () => {
    setImageUri(null);
    setTextContent(null);
    setError('');
    setSavedLocallyPath(null);
    setDownloadProgress(0);
    onClose();
  };

  const handleDownloadAndSave = async (shareAfter: boolean = false) => {
    if (!file) return;

    try {
      setDownloading(true);
      setError('');
      setDownloadProgress(0.1);

      const { apiId, apiHash, token } = await storageService.getAuthCredentials();
      if (!apiId || !apiHash || !token) throw new Error('Missing credentials');

      const client = await getConnectedClient(apiId, apiHash, token);
      const buffer = await client.downloadMedia(file.media, {
        progressCallback: (p: any) => setDownloadProgress(Number(p)),
      });

      if (!buffer) throw new Error('Failed to retrieve file payload');

      const base64Data = (buffer as any).toString('base64');
      const targetFileName = file.fileName || `file_${file.id}`;
      const localUri = `${FileSystem.cacheDirectory}${targetFileName}`;

      await FileSystem.writeAsStringAsync(localUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setSavedLocallyPath(localUri);
      setDownloadProgress(1);

      if (shareAfter) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(localUri);
        }
      }
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (!file) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <GlassCard style={styles.modalContent} variant="glow">
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleArea}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.fileName || 'Untitled File'}
              </Text>
              <Text style={styles.fileMeta}>
                {formatBytes(file.fileSize || 0)} • {formatDate(file.date)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <X size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Preview Area */}
          <View style={styles.previewContainer}>
            {imageUri ? (
              <RNImage
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            ) : textContent !== null ? (
              <ScrollView style={styles.textScroll}>
                <Text style={styles.textContent}>{textContent}</Text>
              </ScrollView>
            ) : (
              <View style={styles.placeholderContainer}>
                <View style={[styles.bigIconBox, { backgroundColor: category?.badgeBg }]}>
                  {category?.category === 'video' ? (
                    <VideoIcon size={48} color={category.color} />
                  ) : category?.category === 'audio' ? (
                    <Music size={48} color={category.color} />
                  ) : (
                    <FileText size={48} color={category?.color || '#38bdf8'} />
                  )}
                </View>
                <Text style={styles.placeholderTitle}>{file.fileName}</Text>
                <Text style={styles.placeholderSub}>
                  {file.mimeType || 'Binary attachment stored on Telegram Cloud'}
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          {downloading && (
            <View style={styles.progressRow}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(downloadProgress * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                Downloading: {Math.round(downloadProgress * 100)}%
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#f87171" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {savedLocallyPath && !downloading ? (
            <View style={styles.successBox}>
              <CheckCircle2 size={16} color="#10b981" />
              <Text style={styles.successText}>File ready on device</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Share"
              variant="secondary"
              icon={<Share2 size={16} color="#ffffff" />}
              onPress={() => handleDownloadAndSave(true)}
              loading={downloading}
              style={styles.actionBtn}
            />
            <Button
              title="Download"
              variant="primary"
              icon={<Download size={16} color="#ffffff" />}
              onPress={() => handleDownloadAndSave(false)}
              loading={downloading}
              style={styles.actionBtn}
            />
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    maxHeight: height * 0.85,
    padding: 16,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  fileMeta: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewContainer: {
    minHeight: 220,
    maxHeight: 340,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginVertical: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  textScroll: {
    width: '100%',
    padding: 12,
  },
  textContent: {
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 24,
  },
  bigIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  placeholderTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  placeholderSub: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
  },
  progressRow: {
    marginVertical: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: {
    color: '#818cf8',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    gap: 8,
  },
  successText: {
    color: '#34d399',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
  },
});
