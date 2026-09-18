import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { FolderPlus, X } from 'lucide-react-native';
import { GlassCard } from '../common/GlassCard';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface CreateFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await onCreate(folderName.trim());
      setFolderName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
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
                      <FolderPlus size={20} color="#818cf8" />
                    </View>
                    <Text style={styles.title}>New Folder</Text>
                  </View>
                  <Button
                    title=""
                    variant="ghost"
                    size="sm"
                    icon={<X size={20} color="#94a3b8" />}
                    onPress={onClose}
                  />
                </View>

                <Text style={styles.subtitle}>
                  Create a new virtual folder backed by the Telegram Master Index.
                </Text>

                <Input
                  label="Folder Name"
                  placeholder="e.g., Photos 2026, Work Projects"
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
                    onPress={onClose}
                    style={styles.cancelBtn}
                    disabled={loading}
                  />
                  <Button
                    title="Create Folder"
                    variant="primary"
                    onPress={handleCreate}
                    loading={loading}
                    style={styles.createBtn}
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
  cancelBtn: {
    paddingHorizontal: 16,
  },
  createBtn: {
    minWidth: 130,
  },
});
