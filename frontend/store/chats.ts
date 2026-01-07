import { create } from "zustand";

interface Chat {
  _id: string;
  title: string;
}

interface Chats {
  chats: Chat[];
  updateChats: (
    chats: Chat[]
  ) => void;
}

export const useChats = create<Chats>((set) => ({
  chats: [],
  updateChats: (
    chats: Chat[]
  ) => set({ chats }),
}));
