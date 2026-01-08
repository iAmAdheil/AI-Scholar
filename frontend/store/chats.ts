import { create } from "zustand";

interface Chat {
  _id: string;
  title: string;
}

interface Chats {
  value: Chat[];
  update: (
    chats: Chat[]
  ) => void;
}

export const useChats = create<Chats>((set) => ({
  value: [],
  update: (
    chats: Chat[]
  ) => set({ value: chats }),
}));
