import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { signOut } from "@/utils/auth";
import { useTheme } from "@/store/theme";

export default function Modal() {
  const { theme, updateTheme } = useTheme();

  const handleSignOut = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          router.dismiss();
          await signOut();
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === "dark" ? "#151718" : "white" },
      ]}
    >
      <View className="py-2 mx-auto mb-8 w-full flex items-center">
        <Text
          style={[
            styles.heading,
            { color: theme === "dark" ? "white" : "black" },
          ]}
        >
          Settings
        </Text>
      </View>
      <View className="px-6 flex flex-col gap-8">
        <View className="flex flex-col gap-4">
          <Text
            style={[
              styles.groupText,
              { color: theme === "dark" ? "white" : "black" },
            ]}
          >
            Account
          </Text>
          <View
            style={{
              backgroundColor: theme === "dark" ? "#282828" : "#f3f4f6",
            }}
            className="px-4 py-3 w-full rounded-2xl flex flex-col gap-6"
          >
            <View className="w-full flex flex-row justify-between items-center">
              <View className="flex flex-row items-center gap-5">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={theme === "dark" ? "white" : "black"}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === "dark" ? "white" : "black" },
                  ]}
                >
                  Email
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === "dark" ? "white" : "black" },
                  ]}
                >
                  email@email.com
                </Text>
              </View>
            </View>

            <View className="w-full flex flex-row justify-between items-center">
              <View className="flex flex-row items-center gap-5">
                <Feather
                  name="phone"
                  size={20}
                  color={theme === "dark" ? "white" : "black"}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === "dark" ? "white" : "black" },
                  ]}
                >
                  Phone
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === "dark" ? "white" : "black" },
                  ]}
                >
                  +91 0123456789
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex flex-col gap-4">
          <Text
            style={[
              styles.groupText,
              { color: theme === "dark" ? "white" : "black" },
            ]}
          >
            App
          </Text>
          <View
            style={{
              backgroundColor: theme === "dark" ? "#282828" : "#f3f4f6",
            }}
            className="py-3 w-full flex flex-col gap-6 rounded-2xl"
          >
            <View className="w-full flex flex-row justify-between items-center">
              <View className="pl-4 flex flex-row items-center gap-5">
                <Feather
                  name="moon"
                  size={20}
                  color={theme === "dark" ? "white" : "black"}
                />
                <Text
                  style={[
                    styles.optionText,
                    { color: theme === "dark" ? "white" : "black" },
                  ]}
                >
                  Appearance
                </Text>
              </View>
              <View className="pr-4">
                <Switch
                  onValueChange={() =>
                    updateTheme(theme === "dark" ? "light" : "dark")
                  }
                  value={theme === "dark"}
                />
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme === "dark" ? "#282828" : "#f3f4f6",
          }}
          className="px-4 py-3 w-full flex flex-row items-center gap-5 rounded-2xl"
          onPress={handleSignOut}
        >
          <MaterialCommunityIcons
            name="logout"
            size={22}
            color={theme === "dark" ? "white" : "black"}
          />
          <Text
            style={[
              styles.optionText,
              { color: theme === "dark" ? "white" : "black" },
            ]}
          >
            Log out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "roboto",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "roboto",
  },
  groupText: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "roboto",
    paddingLeft: 16,
  },
});
