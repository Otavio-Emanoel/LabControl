import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import Sidebar from "@/components/sidebar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo } from "react";
import Nav from "@/components/nav";
import MeusAgendamentosCard from "@/components/meusAgendamentosCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { useRouter } from "expo-router";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import ConnectionBadge from '@/components/ConnectionBadge';

// Tipos retornados pelo backend
interface Reserva {
  id_Reserva: number;
  horario: string; // HH:mm:ss
  dia: string; // YYYY-MM-DD
  justificativa?: string | null;
  fk_aulas?: number | null;
  nome_disciplina?: string | null;
  id_usuario: number;
  nome_usuario: string;
  id_Laboratorio: number;
  numero_laboratorio: string;
}

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addMinutesHHmm(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(0, 0, 0, h || 0, m || 0, 0);
  d.setMinutes(d.getMinutes() + minutes);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semana, setSemana] = useState<{ dia: string; abrev: string; ymd: string }[]>([]);
  const [diaSelecionado, setDiaSelecionado] = useState<string>(""); // YYYY-MM-DD
  const router = useRouter();
  const { ready } = useAuthGuard();

  // Dados do usuário e reservas
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myUserNome, setMyUserNome] = useState<string>("");
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Gera os próximos 7 dias (com YMD)
  const gerarSemanaAtual = () => {
    const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
    const hoje = new Date();
    const novaSemana: { dia: string; abrev: string; ymd: string }[] = [];

    for (let i = 0; i < 7; i++) {
      const data = new Date();
      data.setDate(hoje.getDate() + i);
      novaSemana.push({
        dia: data.getDate().toString(),
        abrev: diasSemana[data.getDay()],
        ymd: formatYMD(data),
      });
    }
    return novaSemana;
  };

  // Carrega usuário e reservas (após auth verificada)
  useEffect(() => {
    if (!ready) return;
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem("auth_user");
        if (stored) {
          const u = JSON.parse(stored);
          setMyUserId(u?.id_usuario ?? null);
          setMyUserNome(u?.nome ?? "");
        }
      } catch {}
      try {
        const res = await api.get<Reserva[]>("/agendamentos/all");
        setReservas(res.data as any);
      } catch (e) {
        console.log("Falha ao carregar reservas", e);
      }
    };
    init();
  }, [ready]);

  useEffect(() => {
    const semanaAtual = gerarSemanaAtual();
    setSemana(semanaAtual);
    setDiaSelecionado(semanaAtual[0].ymd); // seleciona hoje por padrão
  }, []);

  const meusAgendamentosDoDia = useMemo(() => {
    if (!myUserId || !diaSelecionado) return [] as Reserva[];
    return reservas.filter(
      (r) => r.id_usuario === myUserId && (r.dia || "").slice(0, 10) === diaSelecionado
    );
  }, [reservas, myUserId, diaSelecionado]);

  if (!ready) {
    return <View className="flex-1 bg-black" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
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
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center" onPress={() => router.push('/notificacoes')}>
              <Ionicons name="notifications-outline" size={22} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center" onPress={() => router.push('/user')}>
              <Ionicons name="person" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-xs text-white/80 font-madimi mt-12">Olá {myUserNome || "Usuário"}</Text>
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
              onPress={() => setDiaSelecionado(item.ymd)}
              className={`flex-1 mx-1 py-2 rounded-xl ${
                item.ymd === diaSelecionado ? "bg-[#1C4AED]" : ""
              }`}
            >
              <Text
                className={`text-center text-xs ${
                  item.ymd === diaSelecionado ? "text-white" : "text-white/70"
                } font-semibold`}
              >
                {item.abrev}
              </Text>
              <Text
                className={`text-center mt-1 ${
                  item.ymd === diaSelecionado ? "text-white" : "text-white/70"
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
          <TouchableOpacity onPress={() => router.push(`/agendamentos-dia?date=${diaSelecionado}`)}>
            <Text className="text-[#71B9F4] font-semibold">Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de Aulas */}
        <View className="mt-4">
          {meusAgendamentosDoDia.length === 0 ? (
            <Text className="text-white/70">Nenhum agendamento para este dia.</Text>
          ) : (
            meusAgendamentosDoDia.map((a) => {
              const start = (a.horario || "").slice(0, 5);
              const end = start ? addMinutesHHmm(start, 50) : "";
              const horario = start && end ? `${start} - ${end}` : start;
              const titulo = `Laboratório ${a.numero_laboratorio}`;
              const tipo = a.nome_disciplina ? `Aula de ${a.nome_disciplina}` : (a.justificativa || "Reserva");
              return (
                <MeusAgendamentosCard
                  key={a.id_Reserva}
                  titulo={titulo}
                  tipo={tipo}
                  horario={horario}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Navbar inferior fixa */}
      <Nav active="home" />

      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>
    </SafeAreaView>
  );
}