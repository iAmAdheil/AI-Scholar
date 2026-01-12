import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/store/theme";

export default function TabLayout() {
  const { value: theme } = useTheme();
  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]}
        style={[{ flex: 1, backgroundColor: theme === "dark" ? "black" : "white" }]}
      >
        <Stack
          initialRouteName="login"
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              title: "login",
            }}
          />
          <Stack.Screen
            name="otp"
            options={{
              title: "otp",
            }}
          />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
