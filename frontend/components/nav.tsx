import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

type NavProps = {
  active: "home" | "search" | "agendamentos" | "perfil";
  onPress?: (screen: string) => void;
};

export default function Nav({ active, onPress }: NavProps) {
  const icons = [
    { name: "home-outline", key: "home" },
    { name: "search-outline", key: "search" },
    { name: "pause-outline", key: "agendamentos" },
    { name: "person-outline", key: "perfil" },
  ];

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <View className="flex-row bg-[#111] rounded-3xl px-8 py-4 shadow-lg w-[90%] justify-between items-center">
        {icons.map((icon) => {
          const isActive = active === icon.key;
          return (
            <TouchableOpacity
              key={icon.key}
              onPress={() => onPress && onPress(icon.key)}
              className="items-center justify-center flex-1"
            >
              {isActive ? (
                <View className="w-20 h-20 rounded-full bg-black translate-y-[-24] flex-1 items-center justify-center absolute">
                  <View className="w-14 h-14 rounded-full items-center justify-center  bg-blue-600">
                    <Ionicons name={icon.name as any} size={26} color="#fff" />
                  </View>
                </View>
              ) : (
                <Ionicons name={icon.name as any} size={26} color="#888" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
