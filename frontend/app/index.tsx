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
import { useState, useEffect } from "react";
import Nav from "@/components/nav";
import MeusAgendamentosCard from "@/components/meusAgendamentosCard";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semana, setSemana] = useState<{ dia: string; abrev: string }[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<string>("");

  // Gera os próximos 7 dias
  const gerarSemanaAtual = () => {
    const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const hoje = new Date();
    const novaSemana = [];

    for (let i = 0; i < 7; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);
      novaSemana.push({
        dia: data.getDate().toString(),
        abrev: diasSemana[data.getDay()],
      });
    }
    return novaSemana;
  };

  useEffect(() => {
    const semanaAtual = gerarSemanaAtual();
    setSemana(semanaAtual);
    setDiaSelecionado(semanaAtual[0].dia); // seleciona hoje por padrão
  }, []);

  return (
    <View className="flex-1 bg-black">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Background Image */}
      <Image
        source={require("../assets/images/home-background.jpg")}
        className="w-full h-[50%] absolute top-[5%]"
      />

      {/* Conteúdo com Scroll */}
      <ScrollView contentContainerStyle={{ paddingBottom: 200 }} className="px-6 pt-12 mt-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
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

        <Text className="text-xs text-white/80 font-madimi mt-12">Olá User</Text>
        <Text className="text-3xl text-white font-madimi">Bem vindo!</Text>

        {/* Barra de pesquisa */}
        <View className="relative mt-4">
          <View className="absolute top-3 left-4">
            <Ionicons name="search" size={22} color="#828282" />
          </View>

          <TextInput
            placeholder="Pesquise aqui"
            placeholderTextColor="#828282"
            className="bg-[#2A2A2A]/70 rounded-full pl-12 pr-4 py-3 text-white font-madimi"
          />
        </View>

        {/* Seletor de datas dinâmico */}
        <View className="bg-[#000000] rounded-2xl flex-row justify-between px-3 py-3 mt-4">
          {semana.map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setDiaSelecionado(item.dia)}
              className={`flex-1 mx-1 py-2 rounded-xl ${
                item.dia === diaSelecionado ? "bg-[#1C4AED]" : ""
              }`}
            >
              <Text
                className={`text-center text-xs ${
                  item.dia === diaSelecionado ? "text-white" : "text-white/70"
                } font-semibold`}
              >
                {item.abrev}
              </Text>
              <Text
                className={`text-center mt-1 ${
                  item.dia === diaSelecionado ? "text-white" : "text-white/70"
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

        {/* Cards de Aulas */}
        <View className="mt-4">
          <MeusAgendamentosCard titulo="Laboratório" tipo="Aula" horario="08:00 - 08:50" />
          <MeusAgendamentosCard titulo="Matemática" tipo="Aula" horario="09:00 - 09:50" />
          <MeusAgendamentosCard titulo="Física" tipo="Aula" horario="10:00 - 10:50" />
        </View>
      </ScrollView>

      {/* Navbar inferior fixa */}
      <Nav active="home" />
    </View>
  );
}