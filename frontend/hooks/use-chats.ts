import { useState, useEffect } from "react";
import axios from "axios";
import { Chats } from "@/types";

export function useChats(token: string) {
  const [chats, setChats] = useState<Chats>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetch = async () => {
    try {
      setLoading(true);
      const res: any = await axios.get(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/chats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.status !== 200) {
        throw new Error(res.data.message || "Chats could not be fetched");
      }
      console.log("chats fetched");
      setChats(res.data.chats);
    } catch (e: any) {
      console.log(e.message || "Something went wrong when fetching chats");
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    loading,
    chats,
  };
}
