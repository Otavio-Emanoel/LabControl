import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

type NavProps = {
  active: "home" | "search" | "agendamento" | "perfil";
};


export default function Nav({ active }: NavProps) {
  const icons: { name: string; key: "home" | "search" | "agendamento" | "perfil"; href: string }[] = [
    { name: "home-outline", key: "home", href: "/" },
    { name: "search-outline", key: "search", href: "/search" },
    { name: "pause-outline", key: "agendamento", href: "/agendamento" },
    { name: "person-outline", key: "perfil", href: "/user" },
  ];

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <View className="flex-row bg-[#111] rounded-3xl px-8 py-4 shadow-lg w-[90%] justify-between items-center relative">
        {icons.map((icon) => {
          const isActive = active === icon.key;
          return (
            <Link
              key={icon.key}
              href={icon.href as any}
              className="items-center justify-center flex-1"
            >
              {isActive ? (
                <View className="w-20 h-20 rounded-full bg-black bottom-[0.1] flex-1 items-center justify-center absolute">
              <View className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-600">
                    <Ionicons name={icon.name as any} size={26} color="#fff" />
                  </View>
                </View>
              ) : (
                <Ionicons name={icon.name as any} size={26} color="#888" />
              )}
            </Link>
          );
        })}
      </View>
    </View>
  );
}
