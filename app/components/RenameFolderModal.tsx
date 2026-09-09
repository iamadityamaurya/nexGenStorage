import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { FolderNode } from '@/services/folderManager';

interface RenameFolderModalProps {
  visible: boolean;
  folder: FolderNode | null;
  loading: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  visible,
  folder,
  loading,
  onClose,
  onRename,
}) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (folder) {
      setNewName(folder.name);
    }
  }, [folder]);

  const handleSubmit = () => {
    if (!newName.trim() || loading || newName === folder?.name) return;
    onRename(newName.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="pencil" size={18} color={Colors.dark.primaryLight} />
            </View>
            <Text style={styles.title}>Rename Folder</Text>
          </View>

          <Text style={styles.label}>Folder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Folder name"
            placeholderTextColor={Colors.dark.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            editable={!loading}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.renameBtn, (!newName.trim() || loading) && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!newName.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.renameText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.dark.surface2,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.dark.surface3,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  renameBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  renameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
