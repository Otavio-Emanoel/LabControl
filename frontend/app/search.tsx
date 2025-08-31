import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  useAuthGuard();
  const handleClear = () => setSearchText("");

  return (
    <View className="flex-1 bg-black justify-start">
      {/* Barra de pesquisa */}
      <View className="p-4 flex-row items-center w-[100%] mt-32 px-16 rounded-full">
        <TouchableOpacity className="absolute left-4">
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          className="border-solid border-[#999] rounded-full py-2 px-6 border-[1px] flex-1 color-white text-bold text-16"
          placeholder="Pesquisar..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Pesquisas recentes */}
      <View className="w-full flex flex-row justify-between px-6 my-8">
        <Text className="text-[#323232] pl-6">Pesquisas recentes</Text>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text className="text-[#323232] pr-6">Apagar Tudo</Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="flex-1 flex-wrap flex-row gap-4 w-full px-16">
        <TouchableOpacity className="bg-[#2A2A2A] rounded-full py-2 px-4 flex-row justify-between items-center gap-4"><Text className="color-white">Conta</Text><Text className="color-[#bbb] text-xs">x</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A] rounded-full py-2 px-4 flex-row justify-between items-center gap-4"><Text className="color-white">Agendamento</Text><Text className="color-[#bbb] text-xs">x</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A] rounded-full py-2 px-4 flex-row justify-between items-center gap-4"><Text className="color-white">Meu perfil</Text><Text className="color-[#bbb] text-xs">x</Text></TouchableOpacity>
      </View>
      
      <Text className="text-[#323232] w-full px-16 mb-8">Sugestões</Text>
      <View className="flex-1 flex-wrap flex-row gap-4 w-full px-16">
        <TouchableOpacity className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row justify-between items-center gap-4 border-[#003CFF] border-solid border-[1px]"><Text className="color-[#003CFF]"># Conta</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row justify-between items-center gap-4 border-[#003CFF] border-solid border-[1px]"><Text className="color-[#003CFF]"># Agendamento</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row justify-between items-center gap-4 border-[#003CFF] border-solid border-[1px]"><Text className="color-[#003CFF]"># Segurança</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row justify-between items-center gap-4 border-[#003CFF] border-solid border-[1px]"><Text className="color-[#003CFF]"># Notificações</Text></TouchableOpacity>
        <TouchableOpacity className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row justify-between items-center gap-4 border-[#003CFF] border-solid border-[1px]"><Text className="color-[#003CFF]"># Privacidade</Text></TouchableOpacity>
      </View>



    </View>
  );
}
