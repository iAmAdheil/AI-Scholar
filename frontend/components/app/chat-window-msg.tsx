import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { LoaderKitView } from "react-native-loader-kit";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Markdown from "react-native-markdown-display";
import { getStyles } from "@/markdown";

export default function Message({
  id,
  message,
  isUser,
  // isStreaming,
  loading,
  playing,
  startTts,
  stopTts,
}: {
  id: string;
  message: string;
  isUser: boolean;
  // isStreaming: boolean;
  loading: boolean;
  playing: boolean;
  startTts: (msgId: string, text: string) => void;
  stopTts: () => void;
}) {
  const theme = useTheme();
  const markdownStyles = getStyles(theme.dark ? "dark" : "light", 15.5);

  if (isUser) {
    return (
      <View
        className="ml-auto bg-gray-600"
        style={[
          styles.messageContainer,
          { paddingHorizontal: 12, paddingVertical: 12, maxWidth: "80%" },
        ]}
      >
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Inter-Regular",
            color: "white",
          }}
        >
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 14,
          marginRight: "auto",
        },
      ]}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 2,
          borderRadius: 100,
          borderWidth: 1,
          borderColor: theme.dark ? "#333333" : "#dbdbdb",
          marginTop: 5,
        }}
      >
        <Image
          source={require("@/assets/new-images/logo.png")}
          className="w-8 h-8"
        />
      </View>
      <View style={[styles.messageContainer, { maxWidth: "80%" }]}>
        {loading ? (
          <LoaderKitView
            style={{ width: 22, height: 22, marginTop: 22 }}
            name={"BallPulse"}
            animationSpeedMultiplier={0.6}
            color={theme.dark ? "white" : "black"}
          />
        ) : (
          <>
            <Markdown
              //@ts-ignore
              style={{
                ...markdownStyles,
              }}
            >
              {message}
            </Markdown>
            <View className="ml-2 flex flex-row items-center gap-3">
              <TouchableOpacity>
                <Feather
                  name="copy"
                  size={15}
                  color={theme.dark ? "white" : "black"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  playing ? stopTts() : startTts(id, message);
                }}
              >
                {playing ? (
                  <FontAwesome5
                    name="pause-circle"
                    size={18}
                    color={theme.dark ? "white" : "black"}
                  />
                ) : (
                  <Ionicons
                    name="volume-medium-outline"
                    size={20}
                    color={theme.dark ? "white" : "black"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  messageText: {
    fontSize: 15.5,
    fontFamily: "Inter-Regular",
  },
});
