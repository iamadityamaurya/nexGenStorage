import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  HardDrive,
  Bookmark,
  Users,
  MessageSquare,
  Search,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { AmbientBackground } from '../src/components/common/AmbientBackground';
import { GlassCard } from '../src/components/common/GlassCard';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { storageService } from '../src/services/storageService';
import { getConnectedClient, disconnectTelegramClient } from '../src/services/telegramApi';

interface TelegramChat {
  id: string;
  name: string;
  isSavedMessages?: boolean;
  isChannel?: boolean;
  isGroup?: boolean;
  unreadCount?: number;
}

export default function DrivesScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadDialogs = async () => {
      try {
        const { apiId, apiHash, token } = await storageService.getAuthCredentials();

        if (!active) return;
        if (!apiId || !apiHash || !token) {
          router.replace('/login' as any);
          return;
        }

        const client = await getConnectedClient(apiId, apiHash, token);
        const dialogs = await client.getDialogs();

        if (!active) return;

        const mappedChats: TelegramChat[] = dialogs.map((d: any) => {
          const id = d.id ? d.id.toString() : Math.random().toString();
          const isSavedMessages = d.isUser && d.entity?.self;
          const name = isSavedMessages ? 'Saved Messages (Personal Cloud)' : d.name || d.title || 'Unnamed Drive';

          return {
            id,
            name,
            isSavedMessages,
            isChannel: d.isChannel,
            isGroup: d.isGroup,
            unreadCount: d.unreadCount,
          };
        });

        // Place Saved Messages first
        mappedChats.sort((a, b) => (b.isSavedMessages ? 1 : 0) - (a.isSavedMessages ? 1 : 0));

        setChats(mappedChats);
        setError('');
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to fetch Telegram dialogs');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadDialogs();

    return () => {
      active = false;
    };
  }, [router, refreshKey]);

  const handleSelectDrive = async (chat: TelegramChat) => {
    await storageService.setSelectedChat(chat.id, chat.name);
    router.push({
      pathname: '/drive/[chatId]',
      params: { chatId: chat.id, chatName: chat.name },
    } as any);
  };

  const handleLogout = async () => {
    await disconnectTelegramClient();
    await storageService.clearAuth();
    router.replace('/' as any);
  };

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AmbientBackground>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBox}>
                <HardDrive size={22} color="#818cf8" />
              </View>
              <View>
                <Text style={styles.title}>Storage Drives</Text>
                <Text style={styles.subtitle}>Select a Telegram dialogue as your cloud drive</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={18} color="#f87171" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <Input
            placeholder="Search drives, channels, chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color="#64748b" />}
            containerStyle={styles.searchContainer}
          />

          {/* Dialogs List */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#818cf8" />
              <Text style={styles.loadingText}>Connecting to Telegram MTProto...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Button
                title="Retry Connection"
                variant="primary"
                onPress={() => {
                  setLoading(true);
                  setError('');
                  setRefreshKey((prev) => prev + 1);
                }}
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    setRefreshKey((prev) => prev + 1);
                  }}
                  tintColor="#818cf8"
                />
              }
            >
              {filteredChats.map((chat) => {
                return (
                  <TouchableOpacity
                    key={chat.id}
                    activeOpacity={0.7}
                    onPress={() => handleSelectDrive(chat)}
                  >
                    <GlassCard
                      style={styles.driveCard}
                      variant={chat.isSavedMessages ? 'accent' : 'default'}
                    >
                      <View style={styles.driveLeft}>
                        <View
                          style={[
                            styles.driveIconBox,
                            chat.isSavedMessages && styles.savedMessagesIcon,
                          ]}
                        >
                          {chat.isSavedMessages ? (
                            <Bookmark size={20} color="#38bdf8" />
                          ) : chat.isGroup ? (
                            <Users size={20} color="#a855f7" />
                          ) : (
                            <MessageSquare size={20} color="#818cf8" />
                          )}
                        </View>
                        <View style={styles.driveDetails}>
                          <Text
                            style={[
                              styles.driveName,
                              chat.isSavedMessages && styles.savedDriveName,
                            ]}
                            numberOfLines={1}
                          >
                            {chat.name}
                          </Text>
                          <Text style={styles.driveSub}>
                            {chat.isSavedMessages
                              ? 'Default Private Cloud'
                              : chat.isChannel
                              ? 'Broadcast Channel'
                              : 'Chat Drive'}
                          </Text>
                        </View>
                      </View>
                      <ChevronRight size={18} color="#64748b" />
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}

              {filteredChats.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No matching drives found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </AmbientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 1,
  },
  logoutBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  searchContainer: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 30,
    gap: 8,
  },
  driveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  driveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  driveIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  savedMessagesIcon: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  driveDetails: {
    flex: 1,
  },
  driveName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  savedDriveName: {
    color: '#38bdf8',
  },
  driveSub: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
});
