import { View, TouchableOpacity, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";

export default function Search() {
  const [searchText, setSearchText] = useState("");

  const handleClear = () => setSearchText("");

  return (
    <View className="flex-1 bg-black">
      {/* Barra de pesquisa */}
      <View className="p-4 flex-row items-center w-[80%] mt-32 gap-3 rounded-full">
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          style={{ flex: 1, color: "#fff", fontWeight: "bold", fontSize: 18,  }}
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
      <View className="w-full flex-row justify-between px-6 mt-8">
        <Text className="text-[#323232] pl-6">Pesquisas recentes</Text>
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text className="text-[#323232] pr-6">Apagar Tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sugestões */}
      <Text></Text>

    </View>
  );
}
