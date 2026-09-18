import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { Edit3, X } from 'lucide-react-native';
import { FolderNode } from '../../services/folderManager';
import { GlassCard } from '../common/GlassCard';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface RenameFolderModalProps {
  visible: boolean;
  folder: FolderNode | null;
  onClose: () => void;
  onRename: (folder: FolderNode, newName: string) => Promise<void>;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  visible,
  folder,
  onClose,
  onRename,
}) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!folder) return null;

  const currentName = folderName || folder.name;

  const handleRename = async () => {
    if (!currentName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onRename(folder, currentName.trim());
      setFolderName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename folder');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <TouchableWithoutFeedback>
              <GlassCard style={styles.modalContent} variant="glow">
                <View style={styles.header}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconBox}>
                      <Edit3 size={20} color="#818cf8" />
                    </View>
                    <Text style={styles.title}>Rename Folder</Text>
                  </View>
                  <Button
                    title=""
                    variant="ghost"
                    size="sm"
                    icon={<X size={20} color="#94a3b8" />}
                    onPress={handleClose}
                  />
                </View>

                <Text style={styles.subtitle}>
                  Folder UID ({folder.uid}) is preserved. All files remain linked.
                </Text>

                <Input
                  label="New Folder Name"
                  placeholder="Enter new name"
                  defaultValue={folder.name}
                  value={folderName}
                  onChangeText={(text) => {
                    setFolderName(text);
                    if (error) setError('');
                  }}
                  error={error}
                  autoFocus
                />

                <View style={styles.actions}>
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={handleClose}
                    disabled={loading}
                  />
                  <Button
                    title="Save Changes"
                    variant="primary"
                    onPress={handleRename}
                    loading={loading}
                    style={styles.saveBtn}
                  />
                </View>
              </GlassCard>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
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
  container: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  saveBtn: {
    minWidth: 130,
  },
});
