import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useTheme } from "@react-navigation/native";
import Entypo from "@expo/vector-icons/Entypo";
import SideBarChats from "./sidebar-chats";
import { useChats } from "@/hooks/useChats";
import useChatId from "@/store/chat-id";

export default function SideBar({
  props,
}: {
  props: DrawerContentComponentProps;
}) {
  const drawerStatus = useDrawerStatus();

  const theme = useTheme();

  const { update: updateCId } = useChatId();

  const [fetch, setFetch] = useState<boolean>(false);
  const { chats, loading } = useChats(fetch);

  useEffect(() => {
    if (drawerStatus === "open") {
      setFetch(true);
    } else if (drawerStatus === "closed") {
      setFetch(false);
    }
  }, [drawerStatus]);

  const handleNew = () => {
    updateCId("");
    closeDrawer();
  };

  const closeDrawer = () => {
    props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled={false}
      contentContainerStyle={styles.scrollView}
      style={{ backgroundColor: theme.dark ? "#121212" : "white" }}
    >
      <TouchableOpacity
        style={styles.newChatCont}
        onPress={handleNew}
      >
        <Entypo
          name="new-message"
          size={22}
          color={theme.dark ? "white" : "black"}
        />
        <Text
          style={[
            styles.newChatTxt,
            { color: theme.dark ? "white" : "black" },
          ]}
        >
          New Chat
        </Text>
      </TouchableOpacity>
      <SideBarChats
        theme={theme}
        chats={chats}
        loading={loading}
        closeDrawer={closeDrawer}
      />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
    height: "100%",
  },
  newChatCont: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  newChatTxt: {
    fontSize: 16,
    fontWeight: "500",
  },
});