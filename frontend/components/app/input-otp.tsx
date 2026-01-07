import { View, StyleSheet } from "react-native";
import { useTheme } from "@/store/theme";
import { OtpInput } from "react-native-otp-entry";

export default function InputOtp({
  setDigits,
  disabled,
}: {
  setDigits: (digits: string) => void;
  disabled: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View className="w-full flex flex-row justify-between items-center gap-2">
      <OtpInput
        autoFocus={false}
        numberOfDigits={6}
        focusColor="#1DA1F2"
        onTextChange={(otp) => setDigits(otp)}
        disabled={disabled}
        theme={{
          pinCodeTextStyle: {
            ...styles.pinCodeTextStyle,
            color: theme === "dark" ? "white" : "black",
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pinCodeTextStyle: {
    fontSize: 24,
    fontWeight: "400",
  },
});