import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import Sidebar from "@/components/sidebar";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  return (
    <View className="flex-1 bg-white">
      <Sidebar />
      {/* Fundo com gradiente */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-gradient-to-b from-[#1484fc] to-white"
      >
        {/* Header */}
        <View className="px-6 pt-12">
          <View className="flex-row justify-between items-center mb-6">
            <Ionicons name="menu" size={28} color="white" />
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center">
              <Ionicons name="person" size={22} color="#1484fc" />
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-white/80 font-madimi">Olá User</Text>
          <Text className="text-3xl text-white font-bold font-madimi">
            Bem vindo!
          </Text>

          {/* Barra de pesquisa */}
          <View className="relative mt-4">
            <Ionicons
              name="search"
              size={20}
              color="#999"
              style={{ position: "absolute", left: 16, top: 16 }}
            />
            <TextInput
              placeholder="Pesquise aqui"
              placeholderTextColor="#999"
              className="bg-white rounded-full pl-12 pr-4 py-3 text-gray-700"
            />
          </View>

          {/* Seletor de datas */}
          <View className="bg-[#1B283880] rounded-2xl flex-row justify-between px-3 py-3 mt-4">
            {["12", "13", "14", "15", "16", "17", "18"].map((dia, i) => (
              <TouchableOpacity
                key={i}
                className={`flex-1 mx-1 py-2 rounded-xl ${
                  dia === "15" ? "bg-[#1484fc]" : ""
                }`}
              >
                <Text
                  className={`text-center ${
                    dia === "15" ? "text-white" : "text-white/70"
                  } font-semibold`}
                >
                  {dia}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Título de Aulas */}
          <View className="flex-row justify-between items-center mt-6">
            <Text className="text-lg font-semibold text-gray-700">
              Aulas Agendadas
            </Text>
            <Text className="text-[#1484fc] font-semibold">Ver todos</Text>
          </View>
        </View>

        {/* Lista de Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 pl-6"
        >
          {[1, 2].map((item) => (
            <View
              key={item}
              className="bg-white rounded-2xl w-64 h-40 mr-4 shadow-md p-4"
            >
              <Text className="text-lg font-semibold text-gray-800">
                Laboratório
              </Text>
              <Text className="text-sm text-gray-500 mb-3">Aula</Text>
              <View className="flex-row justify-between mt-2">
                <TouchableOpacity className="p-3 bg-[#1484fc] rounded-xl">
                  <Ionicons name="calendar" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="p-3 bg-[#1484fc] rounded-xl">
                  <Ionicons name="time" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="p-3 bg-[#1484fc] rounded-xl">
                  <Ionicons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Navbar inferior */}
    </View>
  );
}
