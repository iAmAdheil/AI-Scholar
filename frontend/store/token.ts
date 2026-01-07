import { create } from "zustand";
import { TokenStore } from "@/utils/mmkv";

interface Token {
  token: string | null;
  updateToken: (
    token: string,
  ) => void;
  deleteToken: () => void;
}

export const useToken = create<Token>((set) => ({
  token: TokenStore.get() || null,
  updateToken: (
    token: string,
  ) => {
    set({ token });
    TokenStore.set(token);
  },
  deleteToken: () => {
    set({ token: null });
  },
}));
