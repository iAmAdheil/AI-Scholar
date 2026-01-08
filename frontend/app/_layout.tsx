import "@/global.css";

import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/store/theme";
import Loader from "@/components/ui/loader";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { value: theme } = useTheme();

  const { route, loadRoute } = useAuth();

  const [splashLoader, setSplashLoader] = useState(true);

  useEffect(() => {
    if (!loadRoute && route) {
      console.log("Navigating to route:", route);
      router.navigate(route);
    }
  }, [route, loadRoute]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    setTimeout(() => {
      setSplashLoader(false);
    }, 1000);
  }, []);

  if (loadRoute || splashLoader) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme === "dark" ? "black" : "white" }}
      >
        <View className="flex-1 justify-center items-center">
          <Loader theme={theme} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme === "dark" ? "black" : "white" }]}>
          <StatusBar hidden={false} style={theme === "dark" ? "light" : "dark"} />
          <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ headerShown: false, presentation: "modal" }}
                />
                <Stack.Screen name="+not-found" />
              </Stack>
            </View>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
});