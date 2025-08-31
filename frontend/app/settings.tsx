// app/Settings.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import Navbar from '../components/nav';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function Settings() {
    useAuthGuard();
  
  return (
    <View className="flex-1 bg-black">
      {/* Topo */}
      <View className="px-6 pt-16">
        {/* Título centralizado com margem superior */}
        <Text className="text-white text-3xl font-bold text-center mt-8 mb-10">
          Configurações
        </Text>

        {/* Botão voltar */}
        <TouchableOpacity className="flex-row items-center mb-6">
          <Ionicons name="chevron-back" size={32} color="#F5F5F5" />
          <Text className="text-white text-xl ml-3">Voltar</Text>
        </TouchableOpacity>
      </View>

      {/* Opções */}
      <View className="mt-4 px-6 space-y-6">
        <TouchableOpacity className="flex-row items-center py-5">
          <Ionicons name="notifications-outline" size={28} color="#F5F5F5" />
          <Text className="text-white text-xl ml-5">Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-5">
          <Ionicons name="shield-checkmark-outline" size={28} color="#F5F5F5" />
          <Text className="text-white text-xl ml-5">Segurança</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-5">
          <Ionicons name="lock-closed-outline" size={28} color="#F5F5F5" />
          <Text className="text-white text-xl ml-5">Privacidade</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center py-5">
          <Feather name="log-out" size={28} color="#F5F5F5" />
          <Text className="text-white text-xl ml-5">Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Navbar fixa embaixo */}
      <View className="absolute bottom-0 left-0 right-0">
        <Navbar active="home" />
      </View>
    </View>
  );
}
