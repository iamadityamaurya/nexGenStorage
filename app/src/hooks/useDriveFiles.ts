import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { getConnectedClient } from '../services/telegramApi';
import { parseFolderLine, FolderNode } from '../services/folderManager';

export interface TelegramFileItem {
  id: number;
  message: string;
  date: number;
  media?: any;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  folderUid?: string;
  isFolder?: boolean;
}

export function useDriveFiles(selectedChatId: string | null) {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [allFiles, setAllFiles] = useState<TelegramFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => setRefreshTrigger((prev) => prev + 1), []);

  useEffect(() => {
    let active = true;

    const fetchFiles = async () => {
      if (!selectedChatId) return;

      try {
        setLoading(true);
        setError(null);

        const { apiId, apiHash, token } = await storageService.getAuthCredentials();

        if (!apiId || !apiHash || !token) {
          throw new Error('Missing Telegram MTProto credentials.');
        }

        const client = await getConnectedClient(apiId, apiHash, token);
        const entityStr = selectedChatId;

        // Fetch index messages
        const fetchAllIndexMessages = async () => {
          let allMatches: any[] = [];
          let offsetId = 0;

          while (true) {
            const batch = await client.getMessages(entityStr, {
              search: '###_UNLIMITED_STORAGE_INDEX_###',
              limit: 100,
              offsetId,
            });

            if (!batch || batch.length === 0) break;
            allMatches = [...allMatches, ...batch];

            const lastMsg = batch[batch.length - 1];
            offsetId = lastMsg.id;

            if (batch.length < 100) break;
          }
          return allMatches;
        };

        // Fetch recent messages and index messages in parallel
        const [searchHistory, recentMessages] = await Promise.all([
          fetchAllIndexMessages(),
          client.getMessages(entityStr, { limit: 150 }),
        ]);

        if (!active) return;

        // 1. Process Folders from Index Manifesto
        const allIndexes = [...recentMessages, ...searchHistory].filter(
          (m) => m.message && m.message.includes('###_UNLIMITED_STORAGE_INDEX_###')
        );

        const uniqueLineSet = new Set<string>();
        let newestDate = Math.floor(Date.now() / 1000);

        allIndexes.forEach((indexMsg) => {
          const lines = indexMsg.message.split('\n');
          lines.forEach((line: string) => {
            const trimmed = line.trim();
            if (trimmed) uniqueLineSet.add(trimmed);
          });
          if (indexMsg.date > newestDate) {
            newestDate = indexMsg.date;
          }
        });

        const parsedFolders: FolderNode[] = Array.from(uniqueLineSet)
          .map((line) => {
            const parsed = parseFolderLine(line);
            if (!parsed) return null;
            return { ...parsed, raw: line };
          })
          .filter(Boolean) as FolderNode[];

        parsedFolders.reverse();

        const uncategorisedFolder: FolderNode = {
          id: 'uncategorised-folder-id',
          uid: 'uncategorised',
          name: 'Uncategorised',
          date: Math.floor(Date.now() / 1000),
          raw: 'uncategorised',
        };

        setFolders([...parsedFolders, uncategorisedFolder]);

        // 2. Process Files from Recent Messages & Dialog History
        const parsedFiles: TelegramFileItem[] = recentMessages
          .filter((msg) => msg.media && !msg.message?.includes('###_UNLIMITED_STORAGE_INDEX_###'))
          .map((msg) => {
            const caption = msg.message || '';
            let fileName = 'Unnamed File';
            let fileSize = 0;
            let mimeType = '';
            const mediaObj = msg.media as any;

            if (mediaObj?.document) {
              const doc = mediaObj.document;
              fileSize = Number(doc.size || 0);
              mimeType = doc.mimeType || '';

              const fileNameAttr = doc.attributes?.find(
                (attr: any) => attr.className === 'DocumentAttributeFilename'
              );
              if (fileNameAttr?.fileName) {
                fileName = fileNameAttr.fileName;
              } else if (mimeType.includes('image')) {
                fileName = `Image_${msg.id}.jpg`;
              } else if (mimeType.includes('video')) {
                fileName = `Video_${msg.id}.mp4`;
              } else if (mimeType.includes('audio')) {
                fileName = `Audio_${msg.id}.mp3`;
              }
            } else if (mediaObj?.photo) {
              fileName = `Photo_${msg.id}.jpg`;
              mimeType = 'image/jpeg';
              fileSize = 1024 * 150; // estimate
            }

            // Extract folder UID tag (e.g. caption ending in _123456)
            let folderUid = 'uncategorised';
            const match = caption.match(/_([0-9]{6})$/);
            if (match) {
              folderUid = match[1];
            }

            return {
              id: msg.id,
              message: caption,
              date: msg.date,
              media: msg.media,
              fileName,
              fileSize,
              mimeType,
              folderUid,
            };
          });

        setAllFiles(parsedFiles);
        setLoading(false);
      } catch (err: any) {
        console.error('Hook fetch files error:', err);
        if (active) {
          setError(err.message || 'Failed to fetch drive contents');
          setLoading(false);
        }
      }
    };

    fetchFiles();

    return () => {
      active = false;
    };
  }, [selectedChatId, refreshTrigger]);

  return { folders, allFiles, loading, error, refresh };
}
