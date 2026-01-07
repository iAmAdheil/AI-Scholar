import "@/global.css";

import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from "react-native";
import { useEffect, useState } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import axios from "axios";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/store/theme";
import { useToken } from "@/store/token";
import { useChats } from "@/store/chats";
import Loader from "@/components/ui/loader";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { theme } = useTheme();
  const { token } = useToken();
  const { updateChats } = useChats();

  const { route, loadRoute } = useAuth();

  const [splashLoader, setSplashLoader] = useState(true);
  const [authStat, setAuthStat] = useState(false);
  const [loadChats, setLoadChats] = useState(false);

  useEffect(() => {
    if (!loadRoute && route) {
      console.log("Navigating to route:", route);
      if (route === "/(tabs)") {
        setAuthStat(true);
      }
      router.navigate(route);
    }
  }, [route, loadRoute]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadChats(true);
        const res: any = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.status !== 200) {
          throw new Error(res.data.msg || "Something went wrong");
        }
        console.log("Chats fetched successfully");
        updateChats(res.data.chats);
      } catch (error: any) {
        console.error(error.msg || "Something went wrong");
        updateChats([]);
      } finally {
        setLoadChats(false);
      }
    }

    if (token && token.length > 0 && authStat) {
      fetchChats();
    }
  }, [token, authStat])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    setTimeout(() => {
      setSplashLoader(false);
    }, 5000);
  }, []);

  if (loadChats || loadRoute || splashLoader) {
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