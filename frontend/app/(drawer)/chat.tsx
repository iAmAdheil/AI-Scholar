import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from "@react-navigation/elements";
import EventSource from "react-native-sse";
import Tts from "react-native-tts";
import { Chunk, Message } from "@/types";
import { generateId } from "@/utils/unique-id";
import useChatId from "@/store/chat-id";
import { type Chat } from "@/types";
import ChatWindow from "@/components/app/chat-window";
import Footer from "@/components/app/chat-footer";

const formatChat = (convo: Chat) => {
  const messages = [];

  for (let i = 0; i < convo.length / 2; i++) {
    const msgId = generateId();

    const promptMsg = convo[2 * i];
    const responseMsg = convo[2 * i + 1];

    messages.push({
      id: msgId,
      prompt: promptMsg.message,
      response: responseMsg.message,
      loading: false,
      streaming: false,
    });
  }
  return { messages, lastMId: messages[messages.length - 1].id || "" };
};

function Index() {
  const { token } = useLocalSearchParams();

  const headerHeight = useHeaderHeight();

  const { value: cId } = useChatId();

  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [playingId, setPlayingId] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const msgIdRef = useRef<string | null>(null);
  const chatIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchChat = async () => {
      setLoadingChat(true);
      setPrompt("");
      try {
        const res: any = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/${cId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const convo: Chat = res.data.chat.conversation || [];
        const { messages, lastMId } = formatChat(convo);

        setMessages(messages);
        msgIdRef.current = lastMId;
      } catch (e: any) {
        console.log(e);
      } finally {
        setLoadingChat(false);
      }
    };

    if (cId && cId.length > 0) {
      chatIdRef.current = cId;
      console.log("fetch Chat:", cId);
      fetchChat();
    }
  }, [cId]);

  useEffect(() => {
    Tts.addEventListener("tts-start", (event) => { });
    Tts.addEventListener("tts-progress", (event) => { });
    Tts.addEventListener("tts-finish", (event) => {
      setPlayingId(null);
    });
    Tts.addEventListener("tts-cancel", (event) => { });

    return () => {
      stopTts();
    };
  }, [cId]);

  useEffect(() => {
    return () => {
      // Clean up EventSource connection
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      msgIdRef.current = null;
      chatIdRef.current = null;
      setStreaming(false);
      setLoadingToken(false);
      setMessages([]);
    }
  }, [cId]);

  const handleSSE = async () => {
    esRef.current?.addEventListener("open", () => {
      console.log("event has been opened");
    });

    esRef.current?.addEventListener("message", (event) => {
      const data = JSON.parse(event.data || "{}") as Chunk;
      if (loadingToken) {
        setLoadingToken(false)
        setMessages((prevState) => {
          const lastMsg = prevState[prevState.length - 1];
          lastMsg.loading = false;
          return [...prevState.slice(0, -1), lastMsg];
        });
      };

      if (data.finished) {
        setPrompt("");
        setMessages((prevState) => {
          const lastMsg = prevState[prevState.length - 1];
          if (lastMsg && lastMsg.id === msgIdRef.current) {
            return [...prevState.slice(0, -1), lastMsg];
          } else {
            return [...prevState];
          }
        });
        chatIdRef.current = data.chatId || "";
        esRef.current?.close();
        return;
      }

      setMessages((prevState) => {
        const lastMsg = prevState[prevState.length - 1];
        if (lastMsg && lastMsg.id === msgIdRef.current) {
          lastMsg.response += data.chunk;
          return [...prevState.slice(0, -1), lastMsg];
        } else {
          return [...prevState];
        }
      });
    });

    esRef.current?.addEventListener("error", (event) => {
      console.log(event);
      esRef.current?.close();
    });

    esRef.current?.addEventListener("close", (event) => {
      console.log("event has been closed");
      esRef.current = null;
      msgIdRef.current = null;
      setStreaming(false);
    });
  };

  const handleSend = async () => {
    if (loadingToken || streaming) {
      return;
    }
    setLoadingToken(true);
    setStreaming(true);
    // Close any existing EventSource connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const newMsgId = generateId();
    const newMsg: Message = {
      id: newMsgId,
      prompt: prompt,
      response: "",
      streaming: true,
      loading: true,
    };
    setMessages((prevState) => [...prevState, newMsg]);
    msgIdRef.current = newMsgId;

    const payload = {
      message: prompt,
    };
    const newES = new EventSource(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/${chatIdRef.current}`,
      // `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    esRef.current = newES;
    await handleSSE();
  };

  const startTts = (msgId: string, text: string) => {
    Tts.stop();
    Tts.speak(text);
    setPlayingId(msgId);
  };

  const stopTts = async () => {
    const result = await Tts.stop();
    console.log(result);
    setPlayingId(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={headerHeight}
    >
      <View className="flex-1" >
        <ChatWindow
          messages={messages}
          msgId={msgIdRef.current || ""}
          loadingChat={loadingChat}
          playingId={playingId}
          startTts={startTts}
          stopTts={stopTts}
        />
      </View>
      <Footer
        prompt={prompt}
        setPrompt={setPrompt}
        handleSend={handleSend}
        loading={streaming}
        chatId={cId || ""}
      />
    </KeyboardAvoidingView>
  );
}

export default Index;

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 20,
    paddingLeft: 18,
    paddingVertical: 12,
    flexShrink: 0,
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "400",
  },
  inputButtonsContainer: {
    position: "absolute",
    bottom: 12,
    right: 22,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  sendContainer: {
    height: 32,
    width: 32,
    borderRadius: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
