import { Platform } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@/store/theme";
import SideBar from "@/components/app/sidebar";
import Avatar from "@/components/app/avatar";

export default function DrawerLayout() {
  const { value: theme } = useTheme();
  const DRAWER_OPTIONS = {
    headerTitle: "",
    headerShadowVisible: Platform.OS === "android" ? false : true,
    headerStyle: {
      backgroundColor: theme === "dark" ? "black" : "transparent",
      borderBottomColor: theme === "dark" ? "#282828" : "lightgray",
      borderBottomWidth: 0.5,
    },
    headerShown: true,
    headerRight: () => <Avatar />,
    headerRightContainerStyle: {
      paddingRight: 15,
      paddingBottom: 6,
    },
  };
  return (
    <Drawer
      initialRouteName="chat"
      drawerContent={(props) => <SideBar props={props} />}
      screenOptions={{ freezeOnBlur: true }}
    >
      <Drawer.Screen
        name="chat"
        options={DRAWER_OPTIONS}
      />
    </Drawer>
  );
}
