import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, usePathname } from "expo-router";
import React, { useEffect, useState, useCallback } from 'react';

type NavKey = "home" | "search" | "agendamento" | "notificacoes" | "perfil";

type NavProps = {
  active: NavKey;
};

export default function Nav({ active }: NavProps) {
  const pathname = usePathname();
  const [unread, setUnread] = useState<number>(0);

  const fetchUnread = useCallback(async () => {
    try {
      // lazy load: só busca se item existir na barra
      const mod = await import('@/lib/api');
      const api = mod.api;
      const resp = await api.get<any[]>('/notificacoes');
      const arr = Array.isArray(resp.data) ? resp.data : [];
      const count = arr.filter(n => n.lida === 0).length;
      setUnread(count);
    } catch {
      // silencia para não poluir UI
    }
  }, []);

  useEffect(() => { fetchUnread(); }, [fetchUnread, pathname]);

  const items: {
    key: NavKey;
    label: string;
    href: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "home", label: "Home", href: "/", icon: "home-outline", activeIcon: "home" },
    { key: "search", label: "Pesquisar", href: "/search", icon: "search-outline", activeIcon: "search" },
    { key: "agendamento", label: "Agenda", href: "/agendamento", icon: "calendar-outline", activeIcon: "calendar" },
    { key: "notificacoes", label: "Notificações", href: "/notificacoes", icon: "notifications-outline", activeIcon: "notifications" },
    { key: "perfil", label: "Perfil", href: "/user", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View className="absolute inset-x-0 bottom-4 items-center">
      <View className="w-[92%] flex-row items-end bg-[#0F1115] rounded-3xl px-4 py-3 shadow-lg relative overflow-visible">
        {items.map((item) => {
          const isActive = active === item.key;
          const showBadge = item.key === 'notificacoes' && unread > 0 && !isActive;
          return (
            <Link key={item.key} href={item.href as any} className="flex-1 items-center justify-end overflow-visible">
              <View className="w-full items-center justify-end relative">
                <View className="h-7" />
                {isActive ? (
                  <View className="absolute -top-6 w-14 h-14 rounded-full bg-black items-center justify-center">
                    <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: '#1C4AED' }}>
                      <Ionicons name={item.activeIcon} size={22} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <View>
                    <Ionicons name={item.icon} size={22} color="#9CA3AF" />
                    {showBadge && (
                      <View style={{ position: 'absolute', top: -6, right: -10, backgroundColor: '#EF4444', minWidth: 18, paddingHorizontal: 4, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>{unread > 9 ? '9+' : unread}</Text>
                      </View>
                    )}
                  </View>
                )}
                <Text className={`text-[10px] mt-1 ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`}>{item.label}</Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
