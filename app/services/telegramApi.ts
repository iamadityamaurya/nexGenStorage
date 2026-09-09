/* eslint-disable @typescript-eslint/no-explicit-any */
// Polyfill Buffer for React Native if not already defined
if (typeof global !== 'undefined' && !global.Buffer) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    global.Buffer = require('buffer').Buffer;
  } catch (e) {
    console.warn('Buffer polyfill failed:', e);
  }
}

import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface TelegramLoginParams {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
  phoneCodeCallback: () => Promise<string>;
  passwordCallback: () => Promise<string>;
  onErrorCallback?: (err: Error) => void;
}

export const initializeTelegramLogin = async ({
  apiId,
  apiHash,
  phoneNumber,
  phoneCodeCallback,
  passwordCallback,
  onErrorCallback,
}: TelegramLoginParams): Promise<{ client: TelegramClient; token: string }> => {
  const stringSession = new StringSession('');
  const numericApiId = parseInt(apiId.trim(), 10);

  const client = new TelegramClient(stringSession, numericApiId, apiHash.trim(), {
    connectionRetries: 5,
  });
  client.setLogLevel('error' as any);

  await client.start({
    phoneNumber: async () => phoneNumber,
    phoneCode: phoneCodeCallback,
    password: passwordCallback,
    onError: onErrorCallback as any,
  });

  const token = client.session.save() as unknown as string;
  activeClient = client;

  return { client, token };
};

let activeClient: TelegramClient | null = null;

export const getConnectedClient = async (
  apiId: string,
  apiHash: string,
  sessionToken: string
): Promise<TelegramClient> => {
  if (activeClient && activeClient.connected) {
    return activeClient;
  }

  const numericApiId = parseInt(apiId.trim(), 10);
  const stringSession = new StringSession(sessionToken);
  const client = new TelegramClient(stringSession, numericApiId, apiHash.trim(), {
    connectionRetries: 5,
  });
  client.setLogLevel('error' as any);

  await client.connect();
  activeClient = client;

  return client;
};

export const disconnectActiveClient = async (): Promise<void> => {
  if (activeClient) {
    try {
      await activeClient.disconnect();
    } catch (e) {
      console.warn('Error disconnecting client:', e);
    }
    activeClient = null;
  }
};

/**
 * Downloads a Telegram media message to the local filesystem and triggers native sharing.
 */
export const downloadAndShareFile = async (
  client: TelegramClient,
  message: any,
  fileName: string,
  onProgress?: (progressText: string) => void
): Promise<string | null> => {
  try {
    onProgress?.('Downloading from Telegram MTProto...');
    const buffer = await client.downloadMedia(message);
    if (!buffer) throw new Error('Failed to retrieve file buffer.');

    onProgress?.('Saving to device storage...');
    const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
    const fileUri = `${cacheDir}${Date.now()}_${sanitizedFileName}`;

    // Convert buffer to base64
    const base64Data = Buffer.from(buffer).toString('base64');
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    onProgress?.('Opening file...');
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        dialogTitle: `Open ${fileName}`,
        mimeType: message.media?.document?.mimeType || undefined,
      });
    }

    return fileUri;
  } catch (err) {
    console.error('Download and share error:', err);
    throw err;
  }
};

/**
 * Uploads a local file picked from mobile to Telegram chat.
 */
export const uploadFileToTelegram = async (
  client: TelegramClient,
  chatId: string,
  fileUri: string,
  fileName: string,
  folderUID?: string,
  onProgress?: (progress: number) => void
): Promise<any> => {
  try {
    // Read file into base64 and convert to Buffer
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileBuffer = Buffer.from(base64, 'base64');

    // Attach folder UID suffix if uploading to a specific virtual folder
    let messageCaption = fileName;
    if (folderUID && folderUID !== 'uncategorised') {
      messageCaption = `${fileName}_${folderUID}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { CustomFile } = require('telegram/client/uploads');
    const customFile = new CustomFile(fileName, fileBuffer.length, '', fileBuffer);

    const uploaded = await client.sendFile(chatId, {
      file: customFile,
      caption: messageCaption,
      forceDocument: true,
      progressCallback: (progressFraction: number) => {
        onProgress?.(Math.round(progressFraction * 100));
      },
    });

    return uploaded;
  } catch (err) {
    console.error('Upload to Telegram error:', err);
    throw err;
  }
};
