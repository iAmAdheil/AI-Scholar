import { Platform, KeyboardAvoidingView } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useHeaderHeight } from "@react-navigation/elements";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/store/theme";
import SideBar from "@/components/app/sidebar";
import Avatar from "@/components/app/avatar";

export default function DrawerLayout() {
  const { value: theme } = useTheme();
  const headerHeight = useHeaderHeight();
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaProvider>
        <SafeAreaView edges={["bottom"]}
          style={[{ flex: 1, backgroundColor: theme === "dark" ? "black" : "white" }]}
        >
          <Drawer
            initialRouteName="chat"
            drawerContent={(props) => <SideBar props={props} />}
          >
            <Drawer.Screen
              name="chat"
              options={DRAWER_OPTIONS}
            />
          </Drawer>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
}
