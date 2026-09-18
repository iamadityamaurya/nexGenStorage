import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Switch } from 'react-native';
import { AlertTriangle, Trash2, X } from 'lucide-react-native';
import { FolderNode } from '../../services/folderManager';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface DeleteConfirmModalProps {
  visible: boolean;
  folder: FolderNode | null;
  onClose: () => void;
  onConfirm: (folder: FolderNode, recursive: boolean) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  folder,
  onClose,
  onConfirm,
}) => {
  const [recursive, setRecursive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  if (!folder) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm(folder, recursive);
      onClose();
    } catch (err: any) {
      setProgressMsg(err.message || 'Error during deletion');
    } finally {
      setLoading(false);
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
                    <AlertTriangle size={20} color="#f87171" />
                  </View>
                  <Text style={styles.title}>Delete Folder</Text>
                </View>
                <Button
                  title=""
                  variant="ghost"
                  size="sm"
                  icon={<X size={20} color="#94a3b8" />}
                  onPress={onClose}
                  disabled={loading}
                />
              </View>

              <Text style={styles.warningText}>
                Are you sure you want to delete <Text style={styles.boldText}>&quot;{folder.name}&quot;</Text>?
              </Text>

              {/* Recursive delete switch */}
              <View style={styles.switchRow}>
                <View style={styles.switchLabelContainer}>
                  <Text style={styles.switchLabel}>Delete child files in chat</Text>
                  <Text style={styles.switchDesc}>
                    Permanently purge all files tagged with this folder&apos;s UID.
                  </Text>
                </View>
                <Switch
                  value={recursive}
                  onValueChange={setRecursive}
                  trackColor={{ false: '#334155', true: '#ef4444' }}
                  thumbColor="#ffffff"
                  disabled={loading}
                />
              </View>

              {progressMsg ? <Text style={styles.progressText}>{progressMsg}</Text> : null}

              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={onClose}
                  disabled={loading}
                />
                <Button
                  title="Delete"
                  variant="danger"
                  onPress={handleDelete}
                  loading={loading}
                  icon={<Trash2 size={16} color="#ffffff" />}
                  style={styles.deleteBtn}
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
    maxWidth: 400,
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
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  warningText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  boldText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchLabel: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  switchDesc: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 2,
  },
  progressText: {
    color: '#818cf8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  deleteBtn: {
    minWidth: 110,
  },
});
