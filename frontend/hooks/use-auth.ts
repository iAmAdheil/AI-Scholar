import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { fetchToken } from "@/utils/token";
import { logout } from "@/utils/auth";

export const useAuth = () => {
  const [route, setRoute] = useState<"/(tabs)/login" | "/(drawer)/chat">("/(tabs)/login");
  const [token, setToken] = useState<string>("");
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
          setToken(response.token);
          setRoute("/(drawer)/chat");
          return;
        }
        setRoute("/(tabs)/login");
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
    token,
  };
};
