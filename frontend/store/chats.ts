import { create } from "zustand";
import { type Chats } from "@/types";

interface SideChats {
  value: Chats;
  update: (
    chats: Chats
  ) => void;
}

export const useChats = create<SideChats>((set) => ({
  value: [],
  update: (
    chats: Chats
  ) => set({ value: chats }),
}));
