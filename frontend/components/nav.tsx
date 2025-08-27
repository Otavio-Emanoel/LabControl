import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Nav() {
  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      {/* Barra de navegação */}
      <View className="flex-row bg-white rounded-3xl px-6 py-3 shadow-lg w-[90%] justify-between">
        {/* Botão Home (Destaque) */}
        <TouchableOpacity className="w-16 h-16 bg-[#1C4AED] rounded-3xl items-center justify-center">
          <Ionicons name="home" size={28} color="white" />
        </TouchableOpacity>

        {/* Outros ícones */}
        <TouchableOpacity className="w-14 h-14 bg-[#1C4AEDB2] rounded-3xl items-center justify-center">
          <Ionicons name="search" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 bg-[#1C4AEDB2] rounded-3xl items-center justify-center">
          <Ionicons name="time" size={26} color="white" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 bg-[#1C4AEDB2] rounded-3xl items-center justify-center">
          <Ionicons name="person" size={26} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
