import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import Sidebar from "@/components/sidebar";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "@/components/nav";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View className="flex-1 bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Background Image */}
      <Image
        source={require("../assets/images/home-background.jpg")}
        className="w-[100%] h-[50%] absolute top-[5%]"
      />

      {/* Header */}
      <View className="px-6 pt-12 mt-5">
        <View className="flex-row justify-between items-center mb-6">
          {/* Sidebar icon */}
          <TouchableOpacity onPress={() => setSidebarOpen(true)}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>

          <View className="flex flex-row gap-4">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <Ionicons name="notifications-outline" size={22} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <Ionicons name="person" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xs text-white/80 font-madimi">Olá User</Text>
        <Text className="text-3xl text-white font-madimi">
          Bem vindo!
        </Text>

        {/* Barra de pesquisa */}
        <View className="relative mt-4">
          <View className="absolute top-3 left-4">
            <Ionicons name="search" size={22} color="#828282" />
          </View>

          <TextInput
            placeholder="Pesquise aqui"
            placeholderTextColor="#828282"
            className="bg-[#2A2A2A] rounded-full pl-12 pr-4 py-3 text-white font-semibold"
          />
        </View>

        {/* Seletor de datas */}
        <View className="bg-[#000000] rounded-2xl flex-row justify-between px-3 py-3 mt-4">
          {[
            { dia: "12", abrev: "ter" },
            { dia: "13", abrev: "qua" },
            { dia: "14", abrev: "qui" },
            { dia: "15", abrev: "sex" },
            { dia: "16", abrev: "sáb" },
            { dia: "17", abrev: "dom" },
            { dia: "18", abrev: "seg" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              className={`flex-1 mx-1 py-2 rounded-xl ${
                item.dia === "15" ? "bg-[#1C4AED]" : ""
              }`}
            >
              <Text
                className={`text-center text-xs ${
                  item.dia === "15" ? "text-white" : "text-white/70"
                } font-semibold`}
              >
                {item.abrev}
              </Text>
              <Text
                className={`text-center mt-1 ${
                  item.dia === "15" ? "text-white" : "text-white/70"
                } font-semibold`}
              >
                {item.dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Título de Aulas */}
        <View className="flex-row justify-between items-center mt-6">
          <Text className="text-lg font-semibold text-white">Agendamentos</Text>
          <Text className="text-[#71B9F4] font-semibold">Ver todos</Text>
        </View>
      </View>

      {/* Card de aula com arredondamento correto */}
      <View className="w-[90%] h-36 mx-auto mt-5 rounded-2xl overflow-hidden">
        <LinearGradient
          colors={["#3B96E2", "#010410"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-1 p-4"
        >
          <Text className="text-white font-bold text-2xl">Laboratório</Text>
          <Text className="text-white font-semibold text-sm mt-1">Aula</Text>
          <View className="flex-1 justify-end items-end">
            <Text className="text-[#828282] font-semibold text-base">
              08:00 - 08:50
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Navbar inferior */}
      <Nav active="home"/>
    </View>
  );
}
