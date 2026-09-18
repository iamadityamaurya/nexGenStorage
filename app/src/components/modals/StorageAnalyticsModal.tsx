import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { PieChart, X, HardDrive } from 'lucide-react-native';
import { TelegramFileItem } from '../../hooks/useDriveFiles';
import { formatBytes, getFileCategory } from '../../utils/fileTypes';
import { GlassCard } from '../common/GlassCard';
import { Button } from '../common/Button';

interface StorageAnalyticsModalProps {
  visible: boolean;
  files: TelegramFileItem[];
  foldersCount: number;
  onClose: () => void;
}

export const StorageAnalyticsModal: React.FC<StorageAnalyticsModalProps> = ({
  visible,
  files,
  foldersCount,
  onClose,
}) => {
  const totalBytes = files.reduce((acc, f) => acc + (f.fileSize || 0), 0);

  // Group by category
  const breakdown: Record<string, { count: number; bytes: number; color: string; label: string }> = {
    image: { count: 0, bytes: 0, color: '#38bdf8', label: 'Images' },
    video: { count: 0, bytes: 0, color: '#a855f7', label: 'Videos' },
    audio: { count: 0, bytes: 0, color: '#ec4899', label: 'Audio' },
    document: { count: 0, bytes: 0, color: '#f59e0b', label: 'Documents' },
    archive: { count: 0, bytes: 0, color: '#10b981', label: 'Archives' },
    code: { count: 0, bytes: 0, color: '#6366f1', label: 'Code' },
    other: { count: 0, bytes: 0, color: '#94a3b8', label: 'Other' },
  };

  files.forEach((file) => {
    const cat = getFileCategory(file.fileName || '').category;
    if (breakdown[cat]) {
      breakdown[cat].count += 1;
      breakdown[cat].bytes += file.fileSize || 0;
    } else {
      breakdown.other.count += 1;
      breakdown.other.bytes += file.fileSize || 0;
    }
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <GlassCard style={styles.modalContent} variant="glow">
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <View style={styles.iconBox}>
                    <PieChart size={20} color="#818cf8" />
                  </View>
                  <Text style={styles.title}>Storage Insights</Text>
                </View>
                <Button
                  title=""
                  variant="ghost"
                  size="sm"
                  icon={<X size={20} color="#94a3b8" />}
                  onPress={onClose}
                />
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Total Stats Card */}
                <View style={styles.totalCard}>
                  <HardDrive size={32} color="#6366f1" />
                  <View style={styles.totalDetails}>
                    <Text style={styles.totalSize}>{formatBytes(totalBytes)}</Text>
                    <Text style={styles.totalSub}>
                      {files.length} {files.length === 1 ? 'file' : 'files'} across {foldersCount} folders
                    </Text>
                  </View>
                </View>

                {/* Multi-colored storage bar */}
                <View style={styles.barContainer}>
                  {Object.entries(breakdown).map(([key, data]) => {
                    const percent = totalBytes > 0 ? (data.bytes / totalBytes) * 100 : 0;
                    if (percent <= 0) return null;
                    return (
                      <View
                        key={key}
                        style={[
                          styles.barSegment,
                          { width: `${Math.max(percent, 2)}%`, backgroundColor: data.color },
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Category Breakdowns */}
                <Text style={styles.sectionTitle}>Distribution Breakdown</Text>
                {Object.entries(breakdown).map(([key, data]) => {
                  if (data.count === 0) return null;
                  const percent = totalBytes > 0 ? ((data.bytes / totalBytes) * 100).toFixed(1) : '0';

                  return (
                    <View key={key} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.colorDot, { backgroundColor: data.color }]} />
                        <Text style={styles.categoryLabel}>{data.label}</Text>
                        <Text style={styles.categoryCount}>({data.count})</Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryBytes}>{formatBytes(data.bytes)}</Text>
                        <Text style={styles.categoryPercent}>{percent}%</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={styles.footer}>
                <Button title="Close" variant="secondary" onPress={onClose} style={styles.closeBtn} />
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
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  totalDetails: {
    flex: 1,
  },
  totalSize: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  totalSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  barContainer: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  barSegment: {
    height: '100%',
  },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryLabel: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryCount: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 6,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryBytes: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryPercent: {
    color: '#64748b',
    fontSize: 11,
  },
  footer: {
    marginTop: 16,
  },
  closeBtn: {
    width: '100%',
  },
});
