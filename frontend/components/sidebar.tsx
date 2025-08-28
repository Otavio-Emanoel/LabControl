import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Sidebar() {
  const handlePress = (label: string) => {
    console.log(`Você clicou em: ${label}`);
  };

  return (
    <View className="w-full h-screen p-16 flex flex-col bg-black">
      {/* ícone de fechar a sidebar */}
      <Ionicons
        name="chevron-back-outline"
        size={35}
        color="#fff"
        className="mb-6 ml-[90%] mt-20"
      />

      {/* Agendamentos */}
      <TouchableOpacity
        onPress={() => handlePress("Agendamentos")}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="calendar-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Agendamentos</Text>
      </TouchableOpacity>

      {/* Notificações */}
      <TouchableOpacity
        onPress={() => handlePress("Notificações")}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="notifications-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Notificações</Text>
      </TouchableOpacity>

      {/* Procurar */}
      <TouchableOpacity
        onPress={() => handlePress("Procurar")}
        className="flex-row items-center mb-4"
      >
        <Ionicons name="search-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Procurar</Text>
      </TouchableOpacity>

      {/* Meu Perfil (ícone sólido) */}
      <TouchableOpacity
        onPress={() => handlePress("Meu Perfil")}
        className="flex-row items-center"
      >
        <Ionicons name="person" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Meu Perfil</Text>
      </TouchableOpacity>

      {/* Configurações (ícone sólido) */}
      <TouchableOpacity
        onPress={() => handlePress("Configurações")}
        className="flex-row items-center"
      >
        <Ionicons
          name="settings"
          size={35}
          color="#fff"
          className="absolute top-72"
        />
        <Text className="ml-2 text-white top-72 pt-2 left-20 font-medium text-xl">
          Configurações
        </Text>
      </TouchableOpacity>
    </View>
  );
}
