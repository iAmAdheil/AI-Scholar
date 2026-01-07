import { Platform } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useTheme } from "@react-navigation/native";
import SideBar from "@/components/app/sidebar";
import Avatar from "@/components/app/header-avatar";

export default function DrawerLayout() {
  const theme = useTheme();
  const DRAWER_OPTIONS = {
    headerTitle: "",
    headerShadowVisible: Platform.OS === "android" ? false : true,
    headerStyle: {
      backgroundColor: theme.dark ? "black" : "transparent",
      borderBottomColor: theme.dark ? "#282828" : "lightgray",
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
      initialRouteName="index"
      drawerContent={(props) => <SideBar props={props} />}
    >
      <Drawer.Screen
        name="index"
        options={DRAWER_OPTIONS}
      />
    </Drawer>
  );
}
