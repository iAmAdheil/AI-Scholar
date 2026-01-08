import { create } from "zustand";

interface ChatId {
  value: string | null;
  update: (
    chatId: string,
  ) => void;
  reset: () => void;
}

const useChatId = create<ChatId>((set) => ({
  value: null,
  update: (
    chatId: string,
  ) => set({ value: chatId }),
  reset: () => set({ value: null }),
}));

export default useChatId;
