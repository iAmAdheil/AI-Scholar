import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { TokenStore } from "@/utils/mmkv";

export const useAuth = () => {
  const [route, setRoute] = useState<"/(tabs)" | "/(drawer)">("/(tabs)");
  const [loadRoute, setLoadRoute] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setRoute("/(drawer)");
      } else {
        setRoute("/(tabs)");
        TokenStore.set("");
      }
      setLoadRoute(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    loadRoute,
    route,
  };
};
