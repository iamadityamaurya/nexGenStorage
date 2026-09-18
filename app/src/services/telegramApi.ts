import '../utils/polyfills';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

let activeClient: TelegramClient | null = null;
let currentCredentials = { apiId: '', apiHash: '', token: '' };

export interface TelegramLoginParams {
  apiId: string;
  apiHash: string;
  phoneNumber: string;
  phoneCodeCallback: () => Promise<string>;
  passwordCallback?: () => Promise<string>;
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

  const client = new TelegramClient(stringSession, parseInt(apiId, 10), apiHash, {
    connectionRetries: 5,
  });
  client.setLogLevel('error' as any);

  await client.start({
    phoneNumber,
    phoneCode: phoneCodeCallback,
    password: passwordCallback || (async () => ''),
    onError: onErrorCallback || ((err) => console.error('Telegram start error:', err)),
  });

  const token = client.session.save() as unknown as string;
  activeClient = client;
  currentCredentials = { apiId, apiHash, token };

  return { client, token };
};

export const getConnectedClient = async (
  apiId: string,
  apiHash: string,
  sessionToken: string
): Promise<TelegramClient> => {
  if (
    activeClient &&
    activeClient.connected &&
    currentCredentials.apiId === apiId &&
    currentCredentials.token === sessionToken
  ) {
    return activeClient;
  }

  // If there was a previous disconnected client, close it
  if (activeClient) {
    try {
      await activeClient.disconnect();
    } catch {
      // ignore
    }
  }

  const stringSession = new StringSession(sessionToken);
  const client = new TelegramClient(stringSession, parseInt(apiId, 10), apiHash, {
    connectionRetries: 5,
  });
  client.setLogLevel('error' as any);

  await client.connect();
  activeClient = client;
  currentCredentials = { apiId, apiHash, token: sessionToken };

  return client;
};

export const disconnectTelegramClient = async (): Promise<void> => {
  if (activeClient) {
    try {
      await activeClient.disconnect();
    } catch (e) {
      console.warn('Error disconnecting client:', e);
    }
    activeClient = null;
    currentCredentials = { apiId: '', apiHash: '', token: '' };
  }
};
