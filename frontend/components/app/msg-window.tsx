import { useEffect, useRef } from "react";
import {
  View,
  Image,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useTheme } from "@/store/theme";
import { DisplayMsgInterface } from "@/types";
import Loader from "./loader";
import Message from "./msg";

function ChatWindow({
  messages,
  msgId,
  loadingChat,
  playingId,
  startTts,
  stopTts,
}: {
  msgId: string;
  messages: DisplayMsgInterface[];
  loadingChat: boolean;
  playingId: string | null;
  startTts: (msgId: string, text: string) => void;
  stopTts: () => void;
}) {
  const { value: theme } = useTheme();

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
      <View className="flex-1 justify-center items-center">
        <Loader theme={theme} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, width: "100%", position: "relative" }}>
      {messages.length === 0 && (
        <Image
          source={require("@/assets/new-images/logo.png")}
          className="w-52 h-52 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-30"
        />
      )}
      <FlatList
        ref={flatListRef}
        scrollEnabled={true}
        keyExtractor={(item: any) => item.id.toString()}
        data={messages}
        keyboardDismissMode="on-drag"
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
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginVertical: 12,
            }}
          >
            <Message
              id={item.id}
              loading={false}
              isUser={true}
              message={item.prompt}
              playing={playingId === item.id}
              startTts={startTts}
              stopTts={stopTts}
            />
            <Message
              id={item.id}
              loading={item.loading}
              isUser={false}
              message={item.response}
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