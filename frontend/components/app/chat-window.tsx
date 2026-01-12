import { useEffect, useRef } from "react";
import {
  View,
  Image,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { type Message as MessageInterface } from "@/types";
import Message from "./chat-window-msg";

const windowWidth = Dimensions.get("window").width;

function ChatWindow({
  messages,
  msgId,
  loadingChat,
  playingId,
  startTts,
  stopTts,
}: {
  msgId: string;
  messages: MessageInterface[];
  loadingChat: boolean;
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
      console.log("scrollToIndex...", i);
      flatListRef.current?.scrollToIndex({
        animated: true,
        index: i,
        viewPosition: 0.1,
      });
    };

    const index = messages.findIndex((msg) => msg.id === msgIdRef.current);
    if (messages.length > 0 && index > -1 && !loadingChat) {
      scrollToEnd(index);
    }
  }, [messages, loadingChat]);

  if (loadingChat) {
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
        <ActivityIndicator size="large" color="#1DA1F2" />
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
        data={messages}
        keyExtractor={(item: any) => item.id.toString()}
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
        style={{
          paddingHorizontal: 10,
          flex: 1,
        }}
        contentContainerStyle={{
          paddingVertical: 20,
        }}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginVertical: 12,
            }}
          >
            <Message
              id={item.id}
              message={item.prompt}
              isUser={true}
              isStreaming={item.isStreaming}
              isLoading={false}
              playing={playingId === item.id}
              startTts={startTts}
              stopTts={stopTts}
            />
            <Message
              id={item.id}
              message={item.response}
              isUser={false}
              isStreaming={item.isStreaming}
              isLoading={item.isLoading}
              playing={playingId === item.id}
              startTts={startTts}
              stopTts={stopTts}
            />
          </View>
        )}
      />
    </View>
  );
}

export default ChatWindow;