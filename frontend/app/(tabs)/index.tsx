import { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
import { phoneSignIn, googleSignIn } from "@/utils/auth";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useConfirmObj } from "@/store/confirmObj";
import { useTheme } from "@/store/theme";

function Signin() {
  const pathname = usePathname();
  const router = useRouter();

  const { theme } = useTheme();
  const { updateConfirmObj } = useConfirmObj();

  const [activeInput, setActiveInput] = useState<"phone" | "">("");
  const [loading, setLoading] = useState(false);

  const [number, setNumber] = useState<string>("");

  const disabled = useMemo(() => {
    return number.length !== 10;
  }, [number]);

  useEffect(() => {
    setLoading(false);
    setNumber("");
  }, []);

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  const handlePhoneSignIn = async () => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      if (number.length !== 10) {
        return;
      }
      const confirmation = await phoneSignIn(number);
      if (confirmation) {
        updateConfirmObj(confirmation);
        router.push("/(tabs)/otp");
      }
    } catch (e: any) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleTest = () => {
    router.push("/(tabs)/test");
  };

  return (
    <View
      className={`w-full flex-1 flex items-center ${Platform.OS === "ios" ? "pt-10" : "pt-20"}`}
    >
      <View className="w-[90%] flex flex-col justify-center">
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/new-images/logo.png")}
            className="w-52 h-52"
          />
        </View>
        <View
          className={`flex-1 flex flex-col gap-10 ${Platform.OS === "ios" ? "pb-10" : "pb-20"}`}
        >
          <View style={styles.inputContainer}>
            <Feather
              name="phone"
              size={18}
              color={activeInput === "phone" ? "#1DA1F2" : "gray"}
              className="absolute left-5 top-2.5 z-10"
            />
            <Text
              style={[
                styles.phoneCountryCode,
                { color: theme === "dark" ? "white" : "black" },
              ]}
            >
              +91
            </Text>
            <TextInput
              keyboardType="numeric"
              maxLength={10}
              value={number}
              onChangeText={setNumber}
              style={[
                styles.phoneInput,
                {
                  borderColor: activeInput === "phone" ? "#1DA1F2" : "gray",
                  color: theme === "dark" ? "white" : "black",
                },
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={"gray"}
              onFocus={() => {
                setActiveInput("phone");
              }}
              onBlur={() => {
                setActiveInput("");
              }}
            />
          </View>
          <TouchableOpacity
            onPress={async () => {
              await handlePhoneSignIn();
            }}
            style={[
              styles.button,
              {
                backgroundColor: loading || disabled ? "gray" : "#1DA1F2",
              },
            ]}
            disabled={loading || disabled}
          >
            {!loading ? (
              <Text style={[styles.buttonText]}>Generate OTP</Text>
            ) : (
              <ActivityIndicator size="small" color="#fff" />
            )}
          </TouchableOpacity>

          <View className="w-full" style={styles.bottomContainer}>
            <TouchableOpacity
              // onPress={googleSignIn}
              onPress={handleTest}
              style={[
                styles.button,
                {
                  backgroundColor: !loading ? "#1DA1F2" : "gray",
                },
              ]}
              className="flex flex-row items-center justify-center gap-6"
              disabled={loading}
            >
              <AntDesign name="google" size={22} color="white" />
              <Text style={[styles.buttonText]}>Login with Google</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Signin;

const styles = StyleSheet.create({
  logoContainer: {
    marginHorizontal: "auto",
    marginBottom: 40,
  },
  inputContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  phoneCountryCode: {
    position: "absolute",
    left: 50,
    top: 8,
    fontSize: 16,
    color: "black",
  },
  phoneInput: {
    width: "100%",
    borderRadius: 5,
    paddingLeft: 85,
    paddingRight: 40,
    paddingVertical: 8,
    color: "black",
    borderBottomWidth: 1,
    fontSize: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#1DA1F2",
    paddingVertical: 14,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "400",
    textAlign: "center",
    fontSize: 16,
  },
  bottomContainer: {
    marginTop: "auto",
  },
});
