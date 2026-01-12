import { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  PermissionsAndroid,
} from "react-native";
import axios from "axios";
import { useLocalSearchParams } from 'expo-router';
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useHeaderHeight } from "@react-navigation/elements";
import EventSource from "react-native-sse";
import Tts from "react-native-tts";
import Voice from "@react-native-voice/voice";
import { Chunk, Message } from "@/types";
import { generateId } from "@/utils/unique-id";
import { useTheme } from "@/store/theme";
import useChatId from "@/store/chat-id";
import { type Chat } from "@/types";
import ChatWindow from "@/components/app/chat-window";

const formatChat = (convo: Chat) => {
  const messages = [];

  for (let i = 0; i < convo.length / 2; i++) {
    const msgId = generateId();
    const promptMsg = convo[2 * i];
    const resMsg = convo[2 * i + 1];

    messages.push({
      _id: msgId,
      response: resMsg.message,
      prompt: promptMsg.message,
      streaming: false,
      loading: false,
    });
  }

  return { messages, lastMId: messages[messages.length - 1]._id || "" };
};

function Footer({
  theme,
  prompt,
  setPrompt,
  handleSend,
  loading,
  chatId,
}: {
  theme: ReactNavigation.Theme;
  prompt: string;
  setPrompt: (value: string) => void;
  handleSend: () => void;
  loading: boolean;
  chatId: string;
}) {
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Set up event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (error) => {
      console.log("error while listening:", error);
      setIsRecording(false);
    };

    const androidCheckPermissions = async () => {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      console.log("permission status to record audio (android):", hasPermission);
      if (!hasPermission) {
        setIsRecording(false);
      }
      const getService = Voice.getSpeechRecognitionServices();
      console.log("speech recognition services (android):", getService);
    };

    androidCheckPermissions();

    // Clean up
    return () => {
      stopListening();
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      });
    };
  }, [chatId]);

  const onSpeechStart = (event: any) => {
    console.log("Event:", event);
    setIsRecording(true);
  };

  const onSpeechEnd = (event: any) => {
    console.log("Event:", event);
    setIsRecording(false);
  };

  const onSpeechResults = (event: any) => {
    console.log("Event:", event);
    const text = event.value[0];
    setPrompt(text);
  };

  const startListening = async () => {
    try {
      await Voice.start("en-US");
      setIsRecording(true);
    } catch (e: any) {
      console.log(e.message || "Something went wrong");
      setIsRecording(false);
    }
  };

  const stopListening = async () => {
    try {
      Voice.removeAllListeners();
      await Voice.stop();
      setIsRecording(false);
    } catch (e: any) {
      console.log(e.message || "Something went wrong");
    }
  };

  return (
    <View className="py-2 relative" >
      <TextInput
        placeholder="Ask anything"
        value={prompt}
        onChangeText={(value) => setPrompt(value)
        }
        multiline={true}
        maxLength={200}
        numberOfLines={8}
        placeholderTextColor={"gray"}
        style={
          [
            styles.input,
            {
              paddingRight: isRecording ? 80 : 60,
              color: theme.dark ? "white" : "black",
              borderColor: theme.dark ? "#282828" : "lightgray",
            },
          ]}
      />
      <View style={styles.inputButtonsContainer}>
        {
          prompt.length === 0 && !isRecording && (
            <TouchableOpacity onPress={startListening}>
              <Feather name="mic" size={22} color={"gray"} />
            </TouchableOpacity>
          )}
        {
          isRecording && (
            <TouchableOpacity onPress={stopListening}>
              <View className="w-7 h-7 mb-1.5 mr-1 bg-red-500 rounded-md" />
            </TouchableOpacity>
          )
        }
        {
          !isRecording && (
            <TouchableOpacity
              style={
                [
                  styles.sendContainer,
                  { backgroundColor: theme.dark ? "white" : "black" },
                ]
              }
              onPress={handleSend}
            >
              {
                loading ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.dark ? "black" : "white"}
                  />
                ) : (
                  <AntDesign
                    name="arrow-up"
                    size={18}
                    color={theme.dark ? "black" : "white"
                    }
                  />
                )
              }
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
}

function Index() {
  const { token } = useLocalSearchParams();

  const headerHeight = useHeaderHeight();

  const { value: theme } = useTheme();
  const { value: cId } = useChatId();

  const [loadingChat, setLoadingChat] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const [playingId, setPlayingId] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);
  const msgIdRef = useRef<string | null>(null);
  const chatIdRef = useRef<string>("");

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

    if (cId) {
      chatIdRef.current = cId;
      console.log("fetch Chat:", cId);
      fetchChat();
    }
  }, [cId]);

  useEffect(() => {
    return () => {
      // Clean up EventSource connection
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      msgIdRef.current = null;
      chatIdRef.current = "";
      setMessages([]);
    }
  }, [cId]);

  const handleSSE = async () => {
    esRef.current?.addEventListener("open", () => {
      console.log("event has been opened");
    });

    esRef.current?.addEventListener("message", (event) => {
      const data = JSON.parse(event.data || "{}") as Chunk;

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
          lastMsg.isLoading = false;
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
    });
  };

  const handleSend = async () => {
    console.log(token.current);
    // Prevent multiple simultaneous requests
    if (loading) {
      return;
    }
    setLoading(true);
    // Close any existing EventSource connection
    if (es.current) {
      es.current.close();
      es.current = null;
    }

    const payload = {
      message: prompt,
    };

    const newMsgId = generateId();

    const newMsg: Message = {
      id: newMsgId,
      response: "",
      prompt: prompt,
      isLoading: true,
    };
    setMessages((prevState) => [...prevState, newMsg]);
    msgId.current = newMsgId;

    const newES = new EventSource(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/${chatIdRef.current}`,
      // `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.current}`,
        },
        body: JSON.stringify(payload),
      },
    );

    es.current = newES;
    await handleSSE();
  };

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
  }, [chatId]);

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
      <SafeAreaView edges={["bottom"]} className="flex-1" >
        <View className="flex-1" >
          <ChatWindow
            messages={messages}
            msgId={msgId.current || ""}
            loadingChat={loadChat}
            playingId={playingId}
            startTts={startTts}
            stopTts={stopTts}
          />
        </View>
        < Footer
          theme={theme}
          prompt={prompt}
          setPrompt={setPrompt}
          handleSend={handleSend}
          loading={loading}
          chatId={chatId || ""
          }
        />
      </SafeAreaView>
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
