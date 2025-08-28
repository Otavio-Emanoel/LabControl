import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <View className="w-full h-screen p-16 flex flex-col bg-black z-50">
      {/* Ícone de fechar a sidebar */}
      <TouchableOpacity onPress={onClose}>
        <Ionicons
          name="chevron-back-outline"
          size={35}
          color="#fff"
          className="mb-6 ml-[90%] mt-20"
        />
      </TouchableOpacity>

      {/* Agendamentos */}
      <TouchableOpacity className="flex-row items-center mb-4">
        <Ionicons name="calendar-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Agendamentos</Text>
      </TouchableOpacity>

      {/* Notificações */}
      <TouchableOpacity className="flex-row items-center mb-4">
        <Ionicons name="notifications-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Notificações</Text>
      </TouchableOpacity>

      {/* Procurar */}
      <TouchableOpacity className="flex-row items-center mb-4">
        <Ionicons name="search-outline" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Procurar</Text>
      </TouchableOpacity>

      {/* Meu Perfil */}
      <TouchableOpacity className="flex-row items-center mb-4">
        <Ionicons name="person" size={35} color="#fff" />
        <Text className="ml-2 text-base text-white">Meu Perfil</Text>
      </TouchableOpacity>

      {/* Configurações */}
      <TouchableOpacity className="flex-row items-center">
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
