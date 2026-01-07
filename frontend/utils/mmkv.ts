// mmkv.ts (Your centralized storage file)
import { createMMKV } from 'react-native-mmkv';

// 1. Create the single instance here
export const storage = createMMKV();

export const TokenStore = {
  get: () => storage.getString('token') || null,
  set: (token: string) => {
    if (token && token.length > 0) {
      storage.set('token', token);
    } else {
      storage.remove('token');
    }
  },
};

export const ThemeStore = {
  get: () => storage.getString('app-theme') as 'light' | 'dark' || 'light',
  set: (theme: 'light' | 'dark') => {
    if (theme) {
      storage.set('app-theme', theme);
    } else {
      storage.remove('app-theme');
    }
  },
};