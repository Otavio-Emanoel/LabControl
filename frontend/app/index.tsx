import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { Platform } from "react-native";
import Sidebar from "@/components/sidebar";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo, useCallback } from "react";
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
  descricao_laboratorio?: string;
  // campos opcionais para representar horário fixo como pseudo-reserva
  isFixo?: boolean;
  id_fixo?: number;
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
  const [cargo, setCargo] = useState<string>("");
  const [fixos, setFixos] = useState<any[]>([]);
  const [labs, setLabs] = useState<{ id_Laboratorio: number; numero: string; descricao: string }[]>([]);

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
          if (u?.cargo) setCargo(u.cargo);
        }
      } catch {}
      try {
        const [reservasRes, fixosRes, labsRes] = await Promise.all([
          api.get<Reserva[]>("/agendamentos/all"),
          api.get<any[]>("/horarios-fixos/"),
          api.get<any[]>("/labs/all"),
        ]);
        setLabs(Array.isArray(labsRes.data) ? labsRes.data : []);
        // Preenche descricao_laboratorio nas reservas normais
        const reservasComDescricao = (reservasRes.data as any[]).map(r => {
          const lab = labsRes.data.find((l: any) => l.id_Laboratorio === r.id_Laboratorio);
          return { ...r, descricao_laboratorio: lab ? lab.descricao : r.numero_laboratorio };
        });
        setReservas(reservasComDescricao);
        setFixos(Array.isArray(fixosRes.data) ? fixosRes.data : []);
      } catch (e) {
        console.log("Falha ao carregar reservas/fixos/labs", e);
      }
      // fallback para cargo via /auth/me
      try {
        const me = await api.get<{ user?: { cargo?: string } }>(`/auth/me`);
        if (me.data?.user?.cargo) setCargo(me.data.user.cargo);
      } catch {}
    };
    init();
  }, [ready]);

  useEffect(() => {
    const semanaAtual = gerarSemanaAtual();
    setSemana(semanaAtual);
    setDiaSelecionado(semanaAtual[0].ymd); 
  }, []);

  const isAuxCoord = useMemo(() => cargo === 'Coordenador' || cargo === 'Auxiliar_Docente' || /coordenador|auxiliar/i.test(cargo || ''), [cargo]);

  // Dia da semana para fixos (igual lógica usada em outras telas: domingo..sabado)
  const ymdToDiaSemana = useCallback((ymd: string) => {
    try {
      const d = new Date(`${ymd}T00:00:00`);
      const idx = d.getDay();
      const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'] as const;
      return dias[idx];
    } catch { return ''; }
  }, []);

  const agendamentosNormaisDoDia = useMemo(() => {
    if (!diaSelecionado) return [] as Reserva[];
    return reservas.filter(r => (r.dia || '').slice(0,10) === diaSelecionado);
  }, [reservas, diaSelecionado]);

  // Mapeia horários fixos do dia selecionado para pseudo-reservas
  const fixosDoDia = useMemo(() => {
    const ds = ymdToDiaSemana(diaSelecionado);
    if (!ds) return [] as Reserva[];
    return (fixos || [])
      .filter(f => String(f.dia_semana).toLowerCase() === ds)
      .map(f => {
        const numeroLab = f.nome_laboratorio || f.numero_laboratorio || f.numero || '';
        const lab = labs.find(l => l.id_Laboratorio === f.id_Laboratorio);
        return {
          id_Reserva: -300000 - Number(f.id_horario_fixo || 0),
          id_fixo: Number(f.id_horario_fixo || 0),
          isFixo: true,
          horario: String(f.horario),
          dia: diaSelecionado,
          justificativa: null,
          fk_aulas: null,
          nome_disciplina: null,
          id_usuario: Number(f.id_usuario),
          nome_usuario: String(f.nome_usuario || ''),
          id_Laboratorio: Number(f.id_Laboratorio),
          numero_laboratorio: String(numeroLab),
          descricao_laboratorio: lab ? lab.descricao : numeroLab,
        } as Reserva;
      });
  }, [fixos, diaSelecionado, ymdToDiaSemana, labs]);

  // Remove fixos que colidem com reservas normais do mesmo lab+horario
  const agendamentosDoDiaAll = useMemo(() => {
    const ocupados = new Set(agendamentosNormaisDoDia.map(r => `${r.id_Laboratorio}-${(r.horario||'').slice(0,5)}`));
    const fixosFiltrados = fixosDoDia.filter(f => !ocupados.has(`${f.id_Laboratorio}-${(f.horario||'').slice(0,5)}`));
    return [...agendamentosNormaisDoDia, ...fixosFiltrados];
  }, [agendamentosNormaisDoDia, fixosDoDia]);

  const meusAgendamentosDoDia = useMemo(() => {
    if (!myUserId || !diaSelecionado) return [] as Reserva[];
    return agendamentosDoDiaAll.filter(r => r.id_usuario === myUserId);
  }, [agendamentosDoDiaAll, myUserId, diaSelecionado]);

  const listaAgendamentosRender = isAuxCoord ? agendamentosDoDiaAll : meusAgendamentosDoDia;

  if (!ready) {
    return <View className="flex-1 bg-black" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Sidebar */}
      {Platform.OS !== 'web' && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Background Image */}
      <Image
        source={require("../assets/images/home-background.jpg")}
        className="w-full h-[50%] absolute top-[5%]"
      />

      {/* Conteúdo com Scroll */}
      <ScrollView contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 100 : 200 }} className="px-6 pt-12 mt-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          {Platform.OS !== 'web' ? (
            <TouchableOpacity onPress={() => setSidebarOpen(true)}>
              <Ionicons name="menu" size={28} color="white" />
            </TouchableOpacity>
          ) : (
            <View />
          )}

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
          <Text className="text-lg font-semibold text-white">{isAuxCoord ? 'Agendamentos do Dia' : 'Meus Agendamentos'}</Text>
          <TouchableOpacity onPress={() => router.push(`/agendamentos-dia?date=${diaSelecionado}`)}>
            <Text className="text-[#71B9F4] font-semibold">Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Cards de Aulas */}
        <View className={Platform.OS === 'web' ? "mt-4 -mx-2 flex-row flex-wrap" : "mt-4"}>
          {listaAgendamentosRender.length === 0 ? (
            <Text className="text-white/70">Nenhum agendamento para este dia.</Text>
          ) : (
            listaAgendamentosRender
              .slice()
              .sort((a,b) => (a.horario||'').localeCompare(b.horario||''))
              .map((a) => {
              const start = (a.horario || "").slice(0, 5);
              const end = start ? addMinutesHHmm(start, 50) : "";
              const horario = start && end ? `${start} - ${end}` : start;
              const titulo = (a.descricao_laboratorio && a.descricao_laboratorio.trim().length > 0)
                ? a.descricao_laboratorio
                : (a.numero_laboratorio || '').toString();
              const isFixo = !!a.isFixo;
              const tipo = isFixo ? 'Horário Fixo' : (a.nome_disciplina ? `Aula de ${a.nome_disciplina}` : (a.justificativa || 'Reserva'));
              return (
                <View key={a.id_Reserva} className={Platform.OS === 'web' ? "w-full lg:basis-1/2 xl:basis-1/3 px-2 mb-4" : "mb-3"}>
                  <MeusAgendamentosCard
                    titulo={titulo}
                    tipo={tipo}
                    horario={horario}
                  />
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

  {/* Navbar inferior fixa (mobile only) */}
  <Nav active="home" />

      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>
    </SafeAreaView>
  );
}