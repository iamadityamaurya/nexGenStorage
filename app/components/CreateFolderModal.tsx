import React, { useState } from 'react';
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

interface CreateFolderModalProps {
  visible: boolean;
  loading: boolean;
  onClose: () => void;
  onCreate: (folderName: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  visible,
  loading,
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');

  const handleSubmit = () => {
    if (!folderName.trim() || loading) return;
    onCreate(folderName.trim());
    setFolderName('');
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
              <Ionicons name="folder-outline" size={20} color={Colors.dark.primaryLight} />
            </View>
            <Text style={styles.title}>Create New Folder</Text>
          </View>

          <Text style={styles.label}>Folder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Work Documents"
            placeholderTextColor={Colors.dark.textMuted}
            value={folderName}
            onChangeText={setFolderName}
            autoFocus
            editable={!loading}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createBtn, (!folderName.trim() || loading) && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={!folderName.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.createText}>Create Folder</Text>
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
  createBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  createText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
