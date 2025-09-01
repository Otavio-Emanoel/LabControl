import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Pressable, Animated, Dimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current; 
  const [visible, setVisible] = useState(isOpen);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) setVisible(true); // garantir que a sidebar seja renderizada

    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -SCREEN_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (!isOpen) setVisible(false); // esconder quando a animação fechar
    });
  }, [isOpen, slideAnim]);

  if (!visible) return null;

  const go = (route: string) => {
    router.push(route as any);
    onClose();
  };

  const soon = (title: string) => {
    Alert.alert(title, "Este recurso estará disponível em breve.");
  };

  return (
    <View className="absolute inset-0 z-50 flex-row">
      {/* Sidebar animada */}
      <Animated.View
        style={{
          transform: [{ translateX: slideAnim }],
          width: "70%",
          height: "100%",
          padding: 32,
          backgroundColor: "black",
          marginTop: 32,
        }}
      >
        {/* Ícone de fechar */}
        <TouchableOpacity onPress={onClose} style={{ alignSelf: "flex-end", marginBottom: 40 }}>
          <Ionicons name="chevron-back-outline" size={35} color="#fff" />
        </TouchableOpacity>

        {/* Menu */}
        <TouchableOpacity className="flex-row items-center mb-4" onPress={() => go("/agendamento")}>
          <Ionicons name="calendar-outline" size={30} color="#fff" />
          <Text className="ml-2 text-base text-white">Agendamentos</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-4" onPress={() => soon("Notificações")}>
          <Ionicons name="notifications-outline" size={30} color="#fff" />
          <Text className="ml-2 text-base text-white">Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-4" onPress={() => go("/search")}>
          <Ionicons name="search-outline" size={30} color="#fff" />
          <Text className="ml-2 text-base text-white">Procurar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mb-4" onPress={() => go("/user")}> 
          <Ionicons name="person-outline" size={30} color="#fff" />
          <Text className="ml-2 text-base text-white">Meu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center mt-10 absolute bottom-[80] left-[40]" onPress={() => go("/settings")}>
          <Ionicons name="settings-outline" size={30} color="#fff" />
          <Text className="ml-2 text-white font-medium text-lg">Configurações</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Overlay */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />
    </View>
  );
}
