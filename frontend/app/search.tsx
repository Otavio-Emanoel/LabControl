import {
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Nav from "../components/nav";
import ConnectionBadge from "@/components/ConnectionBadge";

// Índice simples do que pode ser pesquisado na aplicação
const SEARCH_INDEX: {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  keywords: string[];
}[] = [
    {
      title: "Início",
      subtitle: "Voltar para a tela inicial",
      icon: "home-outline",
      route: "/",
      keywords: ["home", "inicio", "dashboard", "principal"],
    },
    {
      title: "Agendamentos",
      subtitle: "Ver e criar agendamentos",
      icon: "calendar-outline",
      route: "/agendamento",
      keywords: ["agendamento", "agenda", "reservas", "laboratório", "lab"],
    },
    {
      title: "Perfil",
      subtitle: "Ver e editar sua conta",
      icon: "person-outline",
      route: "/user",
      keywords: ["perfil", "conta", "user", "dados", "minha conta"],
    },
    {
      title: "Configurações",
      subtitle: "Notificações, segurança e privacidade",
      icon: "settings-outline",
      route: "/settings",
      keywords: [
        "configuracoes",
        "configurações",
        "settings",
        "notificacoes",
        "notificações",
        "seguranca",
        "segurança",
        "privacidade",
      ],
    },
  ];

const RECENTS_KEY = "recent_searches";

export default function Search() {
  const router = useRouter();

  const [searchText, setSearchText] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Conta",
    "Agendamento",
    "Meu perfil",
  ]);

  // Carrega/salva pesquisas recentes
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(RECENTS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setRecentSearches(parsed);
        }
      } catch { }
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(recentSearches)).catch(
      () => { }
    );
  }, [recentSearches]);

  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .trim();

  const results = useMemo(() => {
    const q = norm(searchText);
    if (!q) return [] as typeof SEARCH_INDEX;
    return SEARCH_INDEX.filter((item) => {
      const hay = [item.title, ...(item.keywords || [])].map(norm);
      return hay.some((h) => h.includes(q) || q.includes(h));
    });
  }, [searchText]);

  // Navega para a rota selecionada e adiciona aos recentes
  const navigateTo = (label: string, route: string) => {
    setRecentSearches((prev) => {
      const value = label.trim();
      if (!value) return prev;
      if (prev.includes(value)) return prev;
      return [value, ...prev].slice(0, 12);
    });
    Keyboard.dismiss();
    router.push(route as any);
  };

  // Limpa apenas o TextInput
  const handleClearInput = () => setSearchText("");

  // Limpa apenas as pesquisas recentes
  const handleClearRecent = () => setRecentSearches([]);

  // Adiciona a pesquisa digitada nas recentes e navega para o primeiro resultado, se houver
  const handleAddRecentOrGo = () => {
    if (searchText.trim() === "") return;
    if (results.length > 0) {
      navigateTo(results[0].title, results[0].route);
      setSearchText("");
      return;
    }
    // sem correspondência direta, apenas salva como recente
    if (!recentSearches.includes(searchText.trim())) {
      setRecentSearches([searchText.trim(), ...recentSearches]);
    }
    setSearchText("");
    Keyboard.dismiss();
  };

  const handleBack = () => router.back();

  const handleRecentPress = (label: string) => {
    const q = norm(label);
    const match = SEARCH_INDEX.find(
      (i) => norm(i.title) === q || i.keywords.map(norm).some((k) => k.includes(q))
    );
    if (match) navigateTo(match.title, match.route);
    else setSearchText(label);
  };

  const handleSuggestionPress = (raw: string) => {
    const label = raw.replace(/^#\s*/, "");
    handleRecentPress(label);
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="absolute top-3 right-3 z-50">
        <ConnectionBadge />
      </View>
      {/* Barra de pesquisa */}
      <View className="p-4 flex-row items-center w-full mt-24 px-4">
        <TouchableOpacity className="absolute left-6" onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TextInput
          className="border-solid rounded-full py-2 px-12 border-[1px] flex-1 text-xl text-white bg-[#2A2A2A]/70"
          placeholder="Pesquisar..."
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
          onSubmitEditing={handleAddRecentOrGo}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearInput} className="ml-2">
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Resultados */}
      {searchText.trim().length > 0 && (
        <View className="w-full px-4 mt-2">
          <Text className="text-[#9CA3AF] mb-2">Resultados</Text>
          <ScrollView className="max-h-80" contentContainerStyle={{ paddingBottom: 8 }}>
            {results.length === 0 ? (
              <Text className="text-[#6B7280]">Nenhum resultado encontrado</Text>
            ) : (
              results.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  onPress={() => navigateTo(item.title, item.route)}
                  className="flex-row items-center py-3 px-3 rounded-xl bg-[#15181E] mb-2 border border-[#23262D]"
                >
                  <View className="w-10 h-10 rounded-full bg-[#1F2430] items-center justify-center mr-3">
                    <Ionicons name={item.icon} size={20} color="#E5E7EB" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base">{item.title}</Text>
                    {item.subtitle ? (
                      <Text className="text-[#9CA3AF] text-xs">{item.subtitle}</Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

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
      <View className="flex flex-wrap flex-row gap-2 w-full px-4">
        {recentSearches.map((item) => (
          <View
            key={item}
            className="flex-row bg-[#2A2A2A] rounded-full py-2 px-4 items-center"
          >
            <TouchableOpacity onPress={() => handleRecentPress(item)} className="pr-2">
              <Text className="text-white">{item}</Text>
            </TouchableOpacity>
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
      <View className="flex flex-wrap flex-row gap-2 w-full px-4">
        {[
          "# Conta",
          "# Agendamento",
          "# Segurança",
          "# Notificações",
          "# Privacidade",
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSuggestionPress(item)}
            className="bg-[#2A2A2A80] rounded-full py-2 px-4 flex-row items-center gap-2 border-[#003CFF] border-[1px]"
          >
            <Text className="text-[#003CFF]">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Nav active="search" />
    </SafeAreaView>
  );
}