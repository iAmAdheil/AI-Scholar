import { create } from "zustand";
import { ThemeStore } from "@/utils/mmkv";

interface Theme {
  theme: 'light' | 'dark';
  updateTheme: (
    theme: 'light' | 'dark',
  ) => void;
}

export const useTheme = create<Theme>((set) => ({
  theme: ThemeStore.get() || 'light',
  updateTheme: (
    theme: 'light' | 'dark',
  ) => {
    set({ theme });
    ThemeStore.set(theme);
  },
}));
