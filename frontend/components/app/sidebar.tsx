import { useCallback, useEffect, useState } from "react";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Text, TouchableOpacity } from "react-native";
import { useChats } from "@/hooks/useChats";
import auth from "@react-native-firebase/auth";

function CustomDrawerContent({
  props,
}: {
  props: DrawerContentComponentProps;
}) {
  const [fetch, setFetch] = useState<boolean>(false);
  const { chats, loading } = useChats(fetch);
  const drawerStatus = useDrawerStatus();

  useEffect(() => {
    if (drawerStatus === "open") {
      setFetch(true);
    }
  }, [drawerStatus]);

  return (
    <DrawerContentScrollView {...props}>
      <Text>Custom Drawer Content</Text>
      <TouchableOpacity onPress={() => auth().signOut()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default CustomDrawerContent;
