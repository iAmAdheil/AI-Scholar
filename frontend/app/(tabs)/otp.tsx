import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Keyboard,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useConfirmObj } from "@/store/confirm-obj";
import InputOtp from "@/components/app/input-otp";

function Page() {
  const { confirmObj } = useConfirmObj();

  const [digits, setDigits] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const disabled = useMemo(() => {
    return digits.length !== 6;
  }, [digits]);

  useEffect(() => {
    if (digits.length === 6) {
      Keyboard.dismiss();
    }
  }, [digits]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setDigits("");
        setLoading(false);
      };
    }, []),
  );

  const handleSubmit = async () => {
    try {
      if (!confirmObj) {
        throw new Error("Confirmation object not found");
      }
      setLoading(true);
      const userCred = await confirmObj.confirm(digits);
      if (!userCred) {
        throw new Error("User credentials not received from confirmation object");
      }
    } catch (error: any) {
      console.error(error.message || "Something went wrong during otp submission");
    }
  };

  return (
    <View
      className={`w-full flex-1 flex flex-col items-center ${Platform.OS === "ios" ? "pt-10 pb-20" : "pt-20 pb-40"}`}
    >
      <View className="w-[90%] flex-1 flex flex-col justify-center">
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/new-images/logo.png")}
            className="w-52 h-52"
          />
        </View>
        <InputOtp setDigits={setDigits} disabled={loading} />
        <View className="w-full" style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={[
              styles.button,
              {
                backgroundColor: loading || disabled ? "gray" : "#1DA1F2",
              },
            ]}
            className="flex flex-row justify-center items-center gap-6"
            disabled={loading || disabled}
          >
            <Text style={[styles.buttonText]}>
              {!loading ? (
                <Text style={[styles.buttonText]}>Continue</Text>
              ) : (
                <ActivityIndicator size="small" color="#fff" />
              )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default Page;

const styles = StyleSheet.create({
  logoContainer: {
    marginHorizontal: "auto",
    marginBottom: 40,
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
