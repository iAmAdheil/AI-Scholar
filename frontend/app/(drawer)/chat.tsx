import { useEffect, useRef, useState } from "react";
import { View, KeyboardAvoidingView, Platform, } from "react-native";
import axios from "axios";
import { useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import EventSource from "react-native-sse";
import Tts from "react-native-tts";
import { ChunkInterface, DisplayMsgInterface, MsgInterface } from "@/types";
import { generateId } from "@/utils/unique-id";
import { useChats } from "@/store/chats";
import useChatId from "@/store/chat-id";
import { useTheme } from "@/store/theme";
import ChatWindow from "@/components/app/msg-window";
import Footer from "@/components/app/footer";

const formatChat = (convo: MsgInterface[]) => {
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

export default function Chat() {
  const { token } = useLocalSearchParams();
  const headerHeight = useHeaderHeight();

  const { value: cId, update: updateCId } = useChatId();
  const { value: chats, update: updateChats } = useChats();
  const { value: theme } = useTheme();

  const [loadingChat, setLoadingChat] = useState(false);
  const [streaming, setStreaming] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<DisplayMsgInterface[]>([]);

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

        const convo: MsgInterface[] = res.data.chat.conversation || [];
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
      setMessages([]);
    }
  }, [cId]);

  const handleSSE = async () => {
    esRef.current?.addEventListener("open", () => {
      console.log("Event has been opened");
    });

    esRef.current?.addEventListener("message", (event) => {
      const data = JSON.parse(event.data || "{}") as ChunkInterface;

      if (data.finished) {
        setPrompt("");
        setMessages((prevState) => {
          const lastMsg = prevState[prevState.length - 1];
          if (lastMsg && lastMsg.id === msgIdRef.current) {
            lastMsg.streaming = false;
            return [...prevState.slice(0, -1), lastMsg];
          } else {
            return [...prevState];
          }
        });
        chatIdRef.current = data.chatId || "";
        updateCId(data.chatId || "");
        if (data.title && data.title.length > 0) {
          const UChats = [...chats];
          UChats.unshift({
            _id: data.chatId || "",
            title: data.title || "",
            createdAt: new Date().toString(),
          })
          updateChats(UChats);
        }
        esRef.current?.close();
        return;
      }

      setMessages((prevState) => {
        const lastMsg = prevState[prevState.length - 1];
        if (lastMsg && lastMsg.id === msgIdRef.current) {
          if (lastMsg.loading) {
            lastMsg.loading = false;
          }
          lastMsg.response += data.chunk;
          return [...prevState.slice(0, -1), lastMsg];
        } else {
          return [...prevState];
        }
      });
    });

    esRef.current?.addEventListener("error", (event) => {
      console.log("Error during streaming:", event);
      setMessages((prevState) => {
        const lastMsg = prevState[prevState.length - 1];
        if (lastMsg && lastMsg.id === msgIdRef.current) {
          lastMsg.streaming = false;
          lastMsg.loading = false;
          lastMsg.response = "Some error occured";
          return [...prevState.slice(0, -1), lastMsg];
        } else {
          return [...prevState];
        }
      })
      esRef.current?.close();
    });

    esRef.current?.addEventListener("close", (event) => {
      console.log("Event has been closed");
      esRef.current = null;
      msgIdRef.current = null;
      setStreaming(false);
      setPrompt("");
    });
  };

  const handleSend = async () => {
    if (streaming) {
      return;
    }
    setStreaming(true);
    // Close any existing EventSource connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    const newMsgId = generateId();
    const newMsg: DisplayMsgInterface = {
      id: newMsgId,
      prompt: prompt,
      response: "",
      streaming: true,
      loading: true,
    };
    setMessages((prevState) => [...prevState, newMsg]);
    msgIdRef.current = newMsgId;

    const payload = {
      msg: prompt,
    };
    const newES = new EventSource(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/${chatIdRef.current}`,
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

  const startTts = async (msgId: string, text: string) => {
    await Tts.stop();
    setPlayingId(msgId);
    Tts.speak(text);
  };

  const stopTts = async () => {
    setPlayingId(null);
    await Tts.stop();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaProvider>
        <SafeAreaView edges={["bottom"]}
          style={[{ flex: 1, backgroundColor: theme === "dark" ? "black" : "white" }]}
        >
          <View className="flex-1">
            <ChatWindow
              msgId={msgIdRef.current || ""}
              loadingChat={loadingChat}
              messages={messages}
              playingId={playingId}
              startTts={startTts}
              stopTts={stopTts}
            />
            <Footer
              prompt={prompt}
              setPrompt={setPrompt}
              handleSend={handleSend}
              loading={streaming}
              chatId={cId || ""}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );

}
