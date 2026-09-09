import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface SetupGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ visible, onClose }) => {
  const steps = [
    {
      num: '1',
      title: 'Create a Storage Chat',
      desc: 'Open Telegram and create a new Private Group or Channel (e.g., "My Cloud Drive").',
    },
    {
      num: '2',
      title: 'Select the Drive',
      desc: 'Return here and pick your private group/channel from the drives list.',
    },
    {
      num: '3',
      title: 'Create Virtual Folders',
      desc: 'Use the "+ New Folder" button to organize your files with clean directories.',
    },
    {
      num: '4',
      title: 'Upload & Access Files',
      desc: 'Upload files up to 4GB each. Everything is saved directly in your private chat.',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.bulb}>💡</Text>
              <Text style={styles.title}>How to Use NexGenStorage</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Follow these simple steps to turn Telegram into your unlimited cloud drive:
            </Text>

            {steps.map((s) => (
              <View key={s.num} style={styles.stepItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>{s.num}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}

            <View style={styles.securityBox}>
              <Text style={styles.securityTitle}>🔒 100% Client-Side & Private</Text>
              <Text style={styles.securityText}>
                Your files are stored exclusively in your personal Telegram private chat. No third-party
                servers ever see or store your data.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.doneText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.dark.surface2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.dark.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulb: {
    fontSize: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.primaryLight,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  securityBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.primaryLight,
    marginBottom: 4,
  },
  securityText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    lineHeight: 16,
  },
  doneBtn: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
