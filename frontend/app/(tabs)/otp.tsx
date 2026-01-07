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
import { useFocusEffect, useRouter } from "expo-router";
import { useConfirmObj } from "@/store/confirmObj";
import { fetchToken } from "@/utils/token";
import InputOtp from "@/components/app/input-otp";

function Otp() {
  const router = useRouter();

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
        setLoading(false);
        setDigits("");
      };
    }, []),
  );

  const handleOtpSubmit = async () => {
    try {
      if (!confirmObj) {
        throw new Error("Confirmation object not found");
      }
      setLoading(true);
      const userCredential = await confirmObj.confirm(digits);
      if (!userCredential) {
        throw new Error("User credentials not found");
      }
      const result = await fetchToken(userCredential.user.uid);
      if (result === 0) {
        throw new Error("Failed to fetch token");
      }
    } catch (e: any) {
      console.log(e);
      router.back();
    }
  };

  return (
    <View
      className={`w-full relative flex-1 flex flex-col ${Platform.OS === "ios" ? "pt-10 pb-20" : "pt-20 pb-40"}`}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/new-images/logo.png")}
          className="w-52 h-52"
        />
      </View>
      <InputOtp setDigits={setDigits} disabled={loading} />
      <View className="w-full" style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() => handleOtpSubmit()}
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
  );
}

export default Otp;

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
