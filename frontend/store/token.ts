import { create } from "zustand";
import { TokenStore } from "@/utils/mmkv";

interface Token {
  value: string | null;
  update: (
    token: string,
  ) => void;
  delete: () => void;
}

export const useToken = create<Token>((set) => ({
  value: TokenStore.get() && (TokenStore.get() as string).length > 0 ? TokenStore.get() : null,
  update: (
    token: string,
  ) => {
    set({ value: token });
    TokenStore.set(token);
  },
  delete: () => {
    set({ value: null });
    TokenStore.set("");
  },
}));
