import { useEffect } from "react";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const API_URL = ((Constants.expoConfig?.extra as any)?.API_URL as string | undefined) || process.env.EXPO_PUBLIC_API_URL;
      const token = await AsyncStorage.getItem("auth_token");

      const goToLogin = async () => {
        if (token) {
          await AsyncStorage.removeItem("auth_token");
        }
        if (pathname !== "/login") {
          router.replace("/login");
        }
      };

      if (!API_URL || !token) {
        await goToLogin();
        return;
      }
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          await goToLogin();
        }
      } catch {
        await goToLogin();
      }
    };
    checkAuth();
  }, [pathname, router]);
}