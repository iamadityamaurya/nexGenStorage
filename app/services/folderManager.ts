/* eslint-disable @typescript-eslint/no-explicit-any */
import { TelegramClient } from 'telegram';

export interface ParsedFolder {
  uid: string;
  name: string;
}

export interface FolderNode {
  id: number | string;
  message: string;
  uid: string;
  name: string;
  date: number;
}

const generateUID = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const parseFolderLine = (line: string): ParsedFolder | null => {
  if (!line || !line.includes('_File')) return null;
  const raw = line.split('_File')[0]; // "123456 - My Folder"
  if (raw.includes(' - ')) {
    const parts = raw.split(' - ');
    return { uid: parts[0], name: parts.slice(1).join(' - ') };
  }
  return { uid: raw, name: raw };
};

export const fetchAllIndexMessages = async (
  client: TelegramClient,
  entityStr: string
): Promise<any[]> => {
  let allMatches: any[] = [];
  let offsetId = 0;
  while (true) {
    const batch = await client.getMessages(entityStr, {
      search: '###_UNLIMITED_STORAGE_INDEX_###',
      limit: 100,
      offsetId,
    });
    if (batch.length === 0) break;
    allMatches = [...allMatches, ...batch];
    offsetId = batch[batch.length - 1].id;
    if (batch.length < 100) break;
  }
  return allMatches;
};

export const createFolderNode = async (
  client: TelegramClient,
  selectedChatId: string,
  folderName: string
): Promise<FolderNode> => {
  const sanitisedName =
    folderName.trim().replace(/[\r\n#_]/g, '').slice(0, 100) || 'Untitled Folder';
  const uid = generateUID();
  const finalPayload = `${uid} - ${sanitisedName}_File`;
  const entityStr = selectedChatId;

  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 }),
  ]);

  const allIndexes = [...recentHistory, ...searchHistory].filter(
    (m) => m.message && m.message.includes('###_UNLIMITED_STORAGE_INDEX_###')
  );

  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];
    const newContent = indexMsg.message + '\n' + finalPayload;

    await client.sendMessage(entityStr, { message: newContent });
    try {
      await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true });
    } catch (e) {
      console.warn('Index clean up error:', e);
    }
  } else {
    const initialText = '###_UNLIMITED_STORAGE_INDEX_###\n' + finalPayload;
    await client.sendMessage(entityStr, { message: initialText });
  }

  return {
    id: Math.floor(Math.random() * 9999999),
    message: finalPayload,
    uid,
    name: sanitisedName,
    date: Math.floor(Date.now() / 1000),
  };
};

export const renameFolderNode = async (
  client: TelegramClient,
  selectedChatId: string,
  oldFolderObj: { uid: string; name: string },
  newName: string,
  onProgress?: (text: string) => void
): Promise<void> => {
  const entityStr = selectedChatId;
  const { uid, name: oldName } = oldFolderObj;

  const sanitisedNewName =
    newName.trim().replace(/[\r\n#_]/g, '').slice(0, 100) || 'Untitled Folder';
  const newPayload = `${uid} - ${sanitisedNewName}_File`;

  if (oldName === newName) return;

  onProgress?.('Updating Master Index Manifesto...');
  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 }),
  ]);

  const allIndexes = [...recentHistory, ...searchHistory].filter(
    (m) => m.message && m.message.includes('###_UNLIMITED_STORAGE_INDEX_###')
  );

  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];

    const lines = indexMsg.message.split('\n');
    const updatedLines = lines.map((line: string) => {
      const parsed = parseFolderLine(line);
      if (parsed && parsed.uid === uid) {
        return newPayload;
      }
      return line;
    });
    const newContent = updatedLines.join('\n');

    await client.sendMessage(entityStr, { message: newContent });
    try {
      await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true });
    } catch (e) {
      console.warn('Error deleting old index message:', e);
    }
  }

  onProgress?.('Directory pointer synchronized.');
};

export const deleteFolderNode = async (
  client: TelegramClient,
  selectedChatId: string,
  folderUID: string
): Promise<void> => {
  const entityStr = selectedChatId;

  const [searchHistory, recentHistory] = await Promise.all([
    fetchAllIndexMessages(client, entityStr),
    client.getMessages(entityStr, { limit: 100 }),
  ]);

  const allIndexes = [...recentHistory, ...searchHistory].filter(
    (m) => m.message && m.message.includes('###_UNLIMITED_STORAGE_INDEX_###')
  );

  if (allIndexes.length > 0) {
    allIndexes.sort((a, b) => b.date - a.date);
    const indexMsg = allIndexes[0];

    const lines = indexMsg.message.split('\n');
    const newLines = lines.filter((line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      const parsed = parseFolderLine(trimmed);
      if (parsed && parsed.uid === folderUID) return false;
      return true;
    });

    let newContent = '';
    if (newLines.length > 1) {
      newContent = newLines.join('\n');
    } else {
      newContent = '###_UNLIMITED_STORAGE_INDEX_###';
    }

    await client.sendMessage(entityStr, { message: newContent });
    try {
      await client.deleteMessages(entityStr, [indexMsg.id], { revoke: true });
    } catch (e) {
      console.warn('Index message cleanup error:', e);
    }
  }
};

export const deleteFolderFiles = async (
  client: TelegramClient,
  selectedChatId: string,
  folderUID: string,
  onProgress?: (text: string) => void
): Promise<void> => {
  const entityStr = selectedChatId;
  const suffix = `_${folderUID}`;

  onProgress?.('Searching for child files...');

  const [searchHistory, recentHistory] = await Promise.all([
    client.getMessages(entityStr, { limit: 10000, search: suffix }),
    client.getMessages(entityStr, { limit: 300 }),
  ]);

  const uniqueMap = new Map();
  [...recentHistory, ...searchHistory].forEach((msg) => {
    if (!uniqueMap.has(msg.id)) uniqueMap.set(msg.id, msg);
  });

  const filesToDelete = Array.from(uniqueMap.values()).filter(
    (msg: any) => msg.message && msg.message.trim().endsWith(suffix) && msg.media
  );

  if (filesToDelete.length === 0) {
    onProgress?.('No child files found.');
    return;
  }

  const ids = filesToDelete.map((msg: any) => msg.id);
  onProgress?.(`Deleting ${ids.length} files...`);

  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    onProgress?.(
      `Deleting files ${i + 1} to ${Math.min(i + 100, ids.length)} of ${ids.length}...`
    );
    await client.deleteMessages(entityStr, chunk, { revoke: true });
  }
};

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
