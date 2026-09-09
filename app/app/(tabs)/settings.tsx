import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { disconnectActiveClient } from '@/services/telegramApi';
import {
  getStoredAuth,
  clearSessionStorage,
  getStorageItem,
  StorageKeys,
} from '@/services/storage';
import { SetupGuideModal } from '@/components/SetupGuideModal';

export default function SettingsScreen() {
  const router = useRouter();

  const [apiId, setApiId] = useState<string | null>(null);
  const [selectedChatName, setSelectedChatName] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const loadInfo = async () => {
      const { apiId: id } = await getStoredAuth();
      const chatName = await getStorageItem(StorageKeys.SELECTED_CHAT_NAME);
      setApiId(id);
      setSelectedChatName(chatName ? decodeURIComponent(chatName) : null);
    };
    loadInfo();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Disconnect Session',
      'Are you sure you want to disconnect? Your session token will be removed from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectActiveClient();
            await clearSessionStorage();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & Account</Text>
        <Text style={styles.headerSubtitle}>Session configuration & security</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name="key-outline" size={18} color={Colors.dark.primaryLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>MTProto Session</Text>
              <Text style={styles.cardSubtitle}>
                {apiId ? `Connected (API ID: ${apiId})` : 'Active Session'}
              </Text>
            </View>
            <View style={styles.activeDot} />
          </View>

          {selectedChatName ? (
            <View style={styles.driveRow}>
              <Text style={styles.driveLabel}>Active Drive:</Text>
              <Text style={styles.driveValue} numberOfLines={1}>
                {selectedChatName}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Resources & Guides */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>HELP & RESOURCES</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsGuideOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="bulb-outline" size={18} color={Colors.dark.primaryLight} />
              <Text style={styles.menuText}>Setup Guide & Instructions</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://my.telegram.org')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="open-outline" size={18} color={Colors.dark.violet} />
              <Text style={styles.menuText}>Telegram Developer Portal (my.telegram.org)</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openURL('https://core.telegram.org/api')}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="document-text-outline" size={18} color={Colors.dark.emeraldLight} />
              <Text style={styles.menuText}>Official MTProto Protocol Docs</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SESSION ACTIONS</Text>

          <TouchableOpacity
            style={[styles.menuItem, styles.destructiveItem]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={18} color={Colors.dark.errorLight} />
              <Text style={[styles.menuText, styles.destructiveText]}>
                Disconnect Telegram Account
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info Footer */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>NexGenStorage Mobile • v2.0</Text>
          <Text style={styles.appDesc}>
            100% Client-Side Decentralized Storage. Not affiliated with Telegram FZ-LLC.
          </Text>
        </View>
      </ScrollView>

      <SetupGuideModal visible={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.dark.surface1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.emerald,
  },
  driveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 10,
    borderRadius: 10,
    gap: 6,
  },
  driveLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.dark.textMuted,
  },
  driveValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primaryLight,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dark.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  destructiveItem: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  destructiveText: {
    color: Colors.dark.errorLight,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  appVersion: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  appDesc: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 14,
  },
});
