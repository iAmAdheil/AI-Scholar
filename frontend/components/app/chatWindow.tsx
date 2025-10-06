import { memo, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { type Message as MessageInterface } from "@/types";
import Markdown from "react-native-markdown-display";
import { getStyles } from "@/markdown";

const windowWidth = Dimensions.get("window").width;

function ChatWindow({
  messages,
  msgId,
  loading,
  playingId,
  startTts,
  stopTts,
}: {
  msgId: string;
  messages: MessageInterface[];
  loading: boolean;
  playingId: string | null;
  startTts: (msgId: string, text: string) => void;
  stopTts: () => void;
}) {
  const flatListRef = useRef<FlatList>(null);
  const msgIdRef = useRef<string | null>(null);

  useEffect(() => {
    msgIdRef.current = msgId;
  }, [msgId]);

  useEffect(() => {
    const scrollToEnd = (i: number) => {
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: i,
        viewPosition: -0.02,
      });
    };

    const index = messages.findIndex((msg) => msg.id === msgIdRef.current);
    if (messages.length > 0 && index > -1 && !loading) {
      scrollToEnd(index);
    }
  }, [messages, loading]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          width: windowWidth,
          position: "relative",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: windowWidth, position: "relative" }}>
      {messages.length === 0 && (
        <Image
          source={require("@/assets/new-images/logo.png")}
          className="w-52 h-52 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-30"
        />
      )}
      <FlatList
        ref={flatListRef}
        onScrollBeginDrag={() => {
          msgIdRef.current = null;
        }}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          });
        }}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <>
            <View className="my-1.5">
              <Message
                id={item.id}
                message={item.prompt}
                isUser={true}
                isStreaming={item.isStreaming}
                playing={playingId === item.id}
                startTts={startTts}
                stopTts={stopTts}
              />
            </View>
            <View className="my-1.5">
              <Message
                id={item.id}
                message={item.response}
                isUser={false}
                isStreaming={item.isStreaming}
                playing={playingId === item.id}
                startTts={startTts}
                stopTts={stopTts}
              />
            </View>
          </>
        )}
        style={{
          paddingHorizontal: 10,
          flex: 1,
        }}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={true}
      />
    </View>
  );
}

const Message = memo(
  ({
    id,
    message,
    isUser,
    isStreaming,
    playing,
    startTts,
    stopTts,
  }: {
    id: string;
    message: string;
    isUser: boolean;
    isStreaming: boolean;
    playing: boolean;
    startTts: (msgId: string, text: string) => void;
    stopTts: () => void;
  }) => {
    const theme = useTheme();
    const markdownStyles = getStyles(
      isUser ? "white" : theme.dark ? "white" : "black",
      15.5,
    );

    if (isUser) {
      return (
        <View
          className="ml-auto bg-gray-600"
          style={[
            messageStyles.messageContainer,
            { paddingHorizontal: 12, paddingVertical: 4 },
          ]}
        >
          <Markdown
            style={{
              ...markdownStyles,
            }}
          >
            {message}
          </Markdown>
        </View>
      );
    }

    return (
      <View
        className="mr-auto"
        style={[
          messageStyles.messageContainer,
          {
            paddingHorizontal: 8,
          },
        ]}
      >
        <Markdown
          style={{
            ...markdownStyles,
          }}
        >
          {message}
        </Markdown>
        <View className="ml-2 flex flex-row items-center gap-3">
          <TouchableOpacity>
            <Feather
              name="copy"
              size={15}
              color={theme.dark ? "white" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              playing ? stopTts() : startTts(id, message);
            }}
          >
            {playing ? (
              <FontAwesome5
                name="pause-circle"
                size={18}
                color={theme.dark ? "white" : "black"}
              />
            ) : (
              <Ionicons
                name="volume-medium-outline"
                size={20}
                color={theme.dark ? "white" : "#3b444b"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

export default ChatWindow;

const messageStyles = StyleSheet.create({
  messageContainer: {
    borderRadius: 10,
    maxWidth: "80%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  messageText: {
    fontSize: 15.5,
    fontFamily: "Inter-Regular",
  },
});
