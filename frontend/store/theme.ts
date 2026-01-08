import { create } from "zustand";
import { ThemeStore } from "@/utils/mmkv";

interface Theme {
  value: 'light' | 'dark';
  update: (
    theme: 'light' | 'dark',
  ) => void;
}

export const useTheme = create<Theme>((set) => ({
  value: ThemeStore.get() || 'light',
  update: (
    theme: 'light' | 'dark',
  ) => {
    set({ value: theme });
    ThemeStore.set(theme);
  },
}));
