import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";

export default function Search() {
  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Conta",
    "Agendamento",
    "Meu perfil",
  ]);

  // Limpa apenas o TextInput
  const handleClearInput = () => setSearchText("");

  // Limpa apenas as pesquisas recentes
  const handleClearRecent = () => setRecentSearches([]);

  // Adiciona a pesquisa digitada nas recentes
  const handleAddRecent = () => {
    if (searchText.trim() === "") return; // não adiciona texto vazio
    // Evita duplicatas
    if (!recentSearches.includes(searchText.trim())) {
      setRecentSearches([searchText.trim(), ...recentSearches]);
    }
    setSearchText(""); // limpa o input
    Keyboard.dismiss(); // fecha o teclado
  };

  return (
    <View className="flex-1 bg-black">
      {/* Barra de pesquisa */}
      <View className="p-4 flex-row items-center w-full mt-24 px-4">
        <TouchableOpacity className="absolute left-6">
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          className="border-solid rounded-full py-2 px-12 border-[1px] flex-1 text-xl text-white bg-[#2A2A2A]/70"
          placeholder="Pesquisar..."
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search" // tecla de search no teclado
          onSubmitEditing={handleAddRecent} // dispara ao apertar enter/search
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearInput} className="ml-2">
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Pesquisas recentes */}
      <View className="w-full flex-row justify-between px-4 mt-6 mb-2">
        <Text className="text-[#323232]">Pesquisas recentes</Text>
        {recentSearches.length > 0 && (
          <TouchableOpacity onPress={handleClearRecent}>
            <Text className="text-[#323232]">Apagar Tudo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips de pesquisas recentes */}
      <View className="flex flex-wrap flex-row gap-4 w-full px-4">
        {recentSearches.map((item) => (
          <View
            key={item}
            className="flex-row bg-[#2A2A2A] rounded-full py-2 px-4 items-center"
          >
            {/* Botão da pesquisa */}
            <TouchableOpacity
              onPress={() => setSearchText(item)}
              className="pr-2"
            >
              <Text className="text-white">{item}</Text>
            </TouchableOpacity>

            {/* Botão de remover */}
            <TouchableOpacity
              onPress={() =>
                setRecentSearches((prev) => prev.filter((i) => i !== item))
              }
            >
              <Text className="text-[#bbb] text-xl">x</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Sugestões */}
      <Text className="text-[#323232] w-full px-4 mt-4 mb-2">Sugestões</Text>
      <View className="flex flex-wrap flex-row gap-4 w-full px-4">
        {[
          "# Conta",
          "# Agendamento",
          "# Segurança",
          "# Notificações",
          "# Privacidade",
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row items-center gap-2 border-[#003CFF] border-[1px]"
          >
            <Text className="text-[#003CFF]">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
