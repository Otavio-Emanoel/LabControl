import { useEffect, useState } from "react";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem("auth_token");

        // Sem token → redireciona imediatamente para login e não renderiza a tela atual
        if (!token) {
          if (pathname !== "/login") router.replace("/login" as any);
          return;
        }

        // Com token → configura header e tenta obter /auth/me (opcional)
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const me = await api.get("/auth/me");
          if (mounted) setUser(me.data?.user ?? null);
        } catch {
          // Token inválido → volta pro login
          if (pathname !== "/login") router.replace("/login" as any);
          return;
        }

        if (mounted) setReady(true);
      } catch {
        if (pathname !== "/login") router.replace("/login" as any);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname, router]);

  return { ready, user };
}

export default useAuthGuard;