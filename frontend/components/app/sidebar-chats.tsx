import {
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import { StyleSheet } from "react-native";
import useChatId from "@/store/chat-id";
import { type Chats } from "@/types";

export default function Chats({
  chats,
  closeDrawer,
  theme,
}: {
  theme: ReactNavigation.Theme;
  chats: Chats;
  closeDrawer: () => void;
}) {
  const { update: updateCId } = useChatId();

  const handleChatPress = (chatId: string) => {
    updateCId(chatId);
    closeDrawer();
  };

  return (
    <ScrollView
      style={styles.scrollContentContainer}
      contentContainerStyle={styles.container}
    >
      {chats.map((chat: { _id: string; title: string }) => {
        return (
          <TouchableOpacity
            key={chat._id}
            onPress={() => handleChatPress(chat._id)}
          >
            <Text
              style={[
                styles.titleText,
                { color: theme.dark ? "white" : "black" },
              ]}
              numberOfLines={1}
            >
              {chat.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  scrollContentContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
