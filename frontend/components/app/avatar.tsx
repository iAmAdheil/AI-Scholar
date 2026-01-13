import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function Avatar() {
  const router = useRouter();
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        avatarStyles.avatorContainer,
        {
          backgroundColor: theme.dark ? "#282828" : "black",
          borderColor: theme.dark ? "#282828" : "black",
        },
      ]}
      onPress={() => router.push("/modal")}
    >
      <FontAwesome5 name="user-alt" size={12} color={"white"} />
    </TouchableOpacity>
  );
}

const avatarStyles = StyleSheet.create({
  avatorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    width: 36,
    height: 36,
    padding: 4,
    borderRadius: 20,
  },
});