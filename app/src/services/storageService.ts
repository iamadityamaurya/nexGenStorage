import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  API_ID: 'telegram_apiId',
  API_HASH: 'telegram_apiHash',
  SESSION_TOKEN: 'telegram_token',
  USER_INFO: 'telegram_user',
  SELECTED_CHAT_ID: 'telegram_selected_chat_id',
  SELECTED_CHAT_NAME: 'telegram_selected_chat_name',
  SAVED_API_PRESETS: 'telegram_api_presets',
};

export const storageService = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error writing ${key} to storage:`, e);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from storage:`, e);
    }
  },

  async getAuthCredentials(): Promise<{ apiId: string | null; apiHash: string | null; token: string | null }> {
    const [apiId, apiHash, token] = await Promise.all([
      this.getItem(StorageKeys.API_ID),
      this.getItem(StorageKeys.API_HASH),
      this.getItem(StorageKeys.SESSION_TOKEN),
    ]);
    return { apiId, apiHash, token };
  },

  async saveAuthCredentials(apiId: string, apiHash: string, token: string): Promise<void> {
    await Promise.all([
      this.setItem(StorageKeys.API_ID, apiId),
      this.setItem(StorageKeys.API_HASH, apiHash),
      this.setItem(StorageKeys.SESSION_TOKEN, token),
    ]);
  },

  async clearAuth(): Promise<void> {
    await Promise.all([
      this.removeItem(StorageKeys.SESSION_TOKEN),
      this.removeItem(StorageKeys.SELECTED_CHAT_ID),
      this.removeItem(StorageKeys.SELECTED_CHAT_NAME),
      this.removeItem(StorageKeys.USER_INFO),
    ]);
  },

  async getSelectedChat(): Promise<{ id: string | null; name: string | null }> {
    const [id, name] = await Promise.all([
      this.getItem(StorageKeys.SELECTED_CHAT_ID),
      this.getItem(StorageKeys.SELECTED_CHAT_NAME),
    ]);
    return { id, name: name ? decodeURIComponent(name) : null };
  },

  async setSelectedChat(id: string, name: string): Promise<void> {
    await Promise.all([
      this.setItem(StorageKeys.SELECTED_CHAT_ID, id),
      this.setItem(StorageKeys.SELECTED_CHAT_NAME, encodeURIComponent(name)),
    ]);
  },
};
