import { UserDataStorage } from 'userdata-storage';

interface StorageStates extends Record<string, string | undefined> {
  azure_openai_key?: string;
  azure_openai_model?: string;
  azure_openai_endpoint?: string;
}

const storage = new UserDataStorage<StorageStates>({
  appName: 'document-writer',
  storageName: 'userdata',
  extName: 'dwconf',
});

export const setConfig = (key: string, value: string) => {
  storage.setSync(key, value);
};

export const getConfig = (key: string) => storage.getSync(key);

export const listConfigs = () => {
  const state = storage.getState();
  return Object.keys(state).map((key) => [key, state[key]]);
};
