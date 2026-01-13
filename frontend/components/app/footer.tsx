import { useState, useEffect } from "react";
import {
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  StyleSheet,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import Voice from "@react-native-voice/voice";
import { useTheme } from "@/store/theme";

export default function Footer({
  handleSend,
  prompt,
  setPrompt,
  loading,
  chatId,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  handleSend: () => void;
  loading: boolean;
  chatId: string;
}) {
  const { value: theme } = useTheme();

  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Set up event listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (error) => {
      console.log("error while listening:", error);
      setIsRecording(false);
    };

    const androidCheckPermissions = async () => {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      console.log("permission status to record audio (android):", hasPermission);
      if (!hasPermission) {
        setIsRecording(false);
      }
      const getService = Voice.getSpeechRecognitionServices();
      console.log("speech recognition services (android):", getService);
    };

    androidCheckPermissions();

    // Clean up
    return () => {
      stopListening();
      Voice.destroy().then(() => {
        Voice.removeAllListeners();
      });
    };
  }, [chatId]);

  const onSpeechStart = (event: any) => {
    console.log("Event:", event);
    setIsRecording(true);
  };

  const onSpeechEnd = (event: any) => {
    console.log("Event:", event);
    setIsRecording(false);
  };

  const onSpeechResults = (event: any) => {
    console.log("Event:", event);
    const text = event.value[0];
    setPrompt(text);
  };

  const startListening = async () => {
    try {
      await Voice.start("en-US");
      setIsRecording(true);
    } catch (e: any) {
      console.log(e.message || "Something went wrong");
      setIsRecording(false);
    }
  };

  const stopListening = async () => {
    try {
      Voice.removeAllListeners();
      await Voice.stop();
      setIsRecording(false);
    } catch (e: any) {
      console.log(e.message || "Something went wrong");
    }
  };

  return (
    <View className="py-2 relative" >
      <TextInput
        placeholder="Ask anything"
        value={prompt}
        onChangeText={(value) => setPrompt(value)
        }
        multiline={true}
        maxLength={200}
        numberOfLines={8}
        placeholderTextColor={"gray"}
        style={
          [
            styles.input,
            {
              paddingRight: isRecording ? 80 : 60,
              color: theme === "dark" ? "white" : "black",
              borderColor: theme === "dark" ? "#282828" : "lightgray",
            },
          ]}
      />
      <View style={styles.inputButtonsContainer}>
        {
          prompt.length === 0 && !isRecording && (
            <TouchableOpacity onPress={startListening}>
              <Feather name="mic" size={22} color={"gray"} />
            </TouchableOpacity>
          )}
        {
          isRecording && (
            <TouchableOpacity onPress={stopListening}>
              <View className="w-7 h-7 mb-1.5 mr-1 bg-red-500 rounded-md" />
            </TouchableOpacity>
          )
        }
        {
          !isRecording && (
            <TouchableOpacity
              style={
                [
                  styles.sendContainer,
                  { backgroundColor: theme === "dark" ? "white" : "black" },
                ]
              }
              onPress={handleSend}
            >
              {
                loading ? (
                  <ActivityIndicator
                    size={"small"}
                    color={theme === "dark" ? "black" : "white"}
                  />
                ) : (
                  <AntDesign
                    name="arrow-up"
                    size={16}
                    color={theme === "dark" ? "black" : "white"
                    }
                  />
                )
              }
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 20,
    paddingLeft: 18,
    paddingVertical: 12,
    flexShrink: 0,
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "400",
  },
  inputButtonsContainer: {
    position: "absolute",
    bottom: 14,
    right: 22,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  sendContainer: {
    height: 32,
    width: 32,
    borderRadius: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});