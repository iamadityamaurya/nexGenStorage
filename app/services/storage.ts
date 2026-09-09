import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  API_ID: 'telegram_apiId',
  API_HASH: 'telegram_apiHash',
  TOKEN: 'telegram_token',
  SELECTED_CHAT_ID: 'telegram_selected_chat_id',
  SELECTED_CHAT_NAME: 'telegram_selected_chat_name',
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return null;
  }
};

export const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};

export const removeStorageItem = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${key} from storage:`, err);
  }
};

export const clearSessionStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      StorageKeys.TOKEN,
      StorageKeys.SELECTED_CHAT_ID,
      StorageKeys.SELECTED_CHAT_NAME,
    ]);
  } catch (err) {
    console.error('Error clearing session storage:', err);
  }
};

export const getStoredAuth = async (): Promise<{
  apiId: string | null;
  apiHash: string | null;
  token: string | null;
}> => {
  const [apiId, apiHash, token] = await Promise.all([
    getStorageItem(StorageKeys.API_ID),
    getStorageItem(StorageKeys.API_HASH),
    getStorageItem(StorageKeys.TOKEN),
  ]);
  return { apiId, apiHash, token };
};
