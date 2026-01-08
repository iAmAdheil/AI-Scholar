import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { fetchToken } from "@/utils/token";
import { TokenStore } from "@/utils/mmkv";
import { logout } from "@/utils/auth";

export const useAuth = () => {
  const [route, setRoute] = useState<"/(tabs)" | "/(drawer)">("/(tabs)");
  const [loadRoute, setLoadRoute] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const response = await fetchToken(user.uid);
          console.log("fetch token response:", response);
          if (!response.token) {
            throw new Error(response.msg);
          }
          TokenStore.set(response.token);
          setRoute("/(drawer)");
        } else {
          setRoute("/(tabs)");
          TokenStore.set("");
        }
        setLoadRoute(false);
      } catch (error: any) {
        console.error(error.message || "Something went wrong during auth state change");
        logout();
      } finally {
        setLoadRoute(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    loadRoute,
    route,
  };
};
