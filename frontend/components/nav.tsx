import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

type NavKey = "home" | "search" | "agendamento" | "perfil";

type NavProps = {
  active: NavKey;
};

export default function Nav({ active }: NavProps) {
  const items: {
    key: NavKey;
    label: string;
    href: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: "home", label: "Home", href: "/", icon: "home-outline", activeIcon: "home" },
    { key: "search", label: "Pesquisar", href: "/search", icon: "search-outline", activeIcon: "search" },
    { key: "agendamento", label: "Agendamentos", href: "/agendamento", icon: "calendar-outline", activeIcon: "calendar" },
    { key: "perfil", label: "Perfil", href: "/user", icon: "person-outline", activeIcon: "person" },
  ];

  return (
    <View className="absolute inset-x-0 bottom-4 items-center">
      <View className="w-[92%] flex-row items-end bg-[#0F1115] rounded-3xl px-6 py-3 shadow-lg relative overflow-visible">
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Link key={item.key} href={item.href as any} className="flex-1 items-center justify-end overflow-visible">
              <View className="w-full items-center justify-end relative">
                {/* espaço reservado para o ícone ativo flutuante */}
                <View className="h-7" />

                {isActive ? (
                  <View className="absolute -top-6 w-14 h-14 rounded-full bg-black items-center justify-center">
                    <View className="w-11 h-11 rounded-full items-center justify-center" style={{ backgroundColor: '#1C4AED' }}>
                      <Ionicons name={item.activeIcon} size={22} color="#fff" />
                    </View>
                  </View>
                ) : (
                  <Ionicons name={item.icon} size={22} color="#9CA3AF" />
                )}

                <Text className={`text-[11px] mt-1 ${isActive ? 'text-white' : 'text-[#9CA3AF]'}`}>{item.label}</Text>
              </View>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
