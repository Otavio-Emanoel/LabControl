// components/MeusAgendamentosCard.tsx
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

// Tipando as props do componente
interface MeusAgendamentosCardProps {
  titulo: string;
  tipo: string;
  horario: string;
}

export default function MeusAgendamentosCard({
  titulo,
  tipo,
  horario,
}: MeusAgendamentosCardProps) {
  return (
    <View className="w-[90%] h-36 mx-auto mt-5 rounded-2xl overflow-hidden">
      <LinearGradient
        colors={["#3B96E2", "#010410"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-1 p-4"
      >
        <Text className="text-white font-bold text-2xl">{titulo}</Text>
        <Text className="text-white font-semibold text-sm mt-1">{tipo}</Text>
        <View className="flex-1 justify-end items-end">
          <Text className="text-[#828282] font-semibold text-base">{horario}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}
