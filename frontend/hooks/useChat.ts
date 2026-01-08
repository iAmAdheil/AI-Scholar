import ky from "ky";
import { useState, useEffect } from "react";
import useChatId from "@/store/chat-id";

export const useChat = () => {
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const chatId = useChatId((state: any) => state.chatId);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const res: any = await ky
          .get(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/user/chat/${chatId}`)
          .json();
        setChat(res.chat);
      } catch (error) {
        console.error(error);
        setChat([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [chatId]);

  return {
    loading,
    chat,
    setChat,
  };
};
