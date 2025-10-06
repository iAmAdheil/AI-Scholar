import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { View } from "react-native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import useTheme from "@/store/theme";

import "@/global.css";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useTheme();
  const { route, loading } = useAuth();
  const router = useRouter();

  const [splashLoader, setSplashLoader] = useState(true);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loading && route) {
      console.log("Navigating to route:", route);
      router.navigate(`${route}`);
    }
  }, [route, loading]);

  useEffect(() => {
    setTimeout(() => {
      setSplashLoader(false);
    }, 1000);
  }, []);

  if (!loaded || loading || splashLoader) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme === "dark" ? "black" : "white" }}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={`purple`} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
