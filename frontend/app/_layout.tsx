import "@/global.css";

import { View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import axios from "axios";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/store/theme";
import { useChats } from "@/store/chats";
import Loader from "@/components/ui/loader";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const { value: theme } = useTheme();

  const { route, token, loadRoute } = useAuth();
  const { update: updateChats } = useChats();

  const [splashLoader, setSplashLoader] = useState(true);

  useEffect(() => {
    if (!loadRoute && route) {
      console.log("Navigating to route:", route);
      if (route === "/(tabs)/login") {
        router.navigate(route);
      } else if (route === "/(drawer)/chat") {
        router.navigate({
          pathname: route,
          params: {
            token,
          },
        });
      }
    }
  }, [route, loadRoute]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/chat/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.status !== 200) {
          throw new Error(res.data.message || "Chats could not be fetched");
        }
        console.log("Chats fetched successfully");
        updateChats(res.data.chats);
      } catch (e: any) {
        console.log(e.message || "Something went wrong when fetching chats");
        updateChats([]);
      }
    }

    if (token && token.length > 0) {
      fetchChats();
    }
  }, [token])

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
      <SafeAreaProvider>
        <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: theme === "dark" ? "black" : "white" }]}>
          <View className="flex-1 justify-center items-center">
            <Loader theme={theme} />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme === "dark" ? DarkTheme : DefaultTheme}>
        <StatusBar hidden={false} style={theme === "dark" ? "light" : "dark"} />
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
      </ThemeProvider >
    </GestureHandlerRootView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});