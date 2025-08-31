import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, getApiBaseUrl } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import Nav from '@/components/nav';

interface Lab {
  id_Laboratorio: number;
  numero: string;
}

interface Reserva {
  id_Reserva: number;
  horario: string; // "HH:mm:ss"
  dia: string; // "YYYY-MM-DD"
  justificativa?: string;
  id_usuario: number;
  nome_usuario: string;
  id_Laboratorio: number;
  numero_laboratorio: string;
}

function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Converte valor de dia (Date ou string) para 'YYYY-MM-DD'
function toYMD(dia: unknown): string {
  if (typeof dia === 'string') return dia.slice(0, 10);
  if (dia && typeof dia === 'object' && typeof (dia as any).getFullYear === 'function') {
    const dt = dia as Date;
    return formatYMD(dt);
  }
  const dt = new Date(dia as any);
  return isNaN(dt.getTime()) ? '' : formatYMD(dt);
}

const WEEK_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export default function AgendamentoPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'professores' | 'organizacao'>('professores');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [current, setCurrent] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [myUserId, setMyUserId] = useState<number | null>(null);

  useAuthGuard();

  // Carrega usuário do storage
  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((s) => {
      if (s) {
        try {
          const u = JSON.parse(s);
          setMyUserId(u?.id_usuario ?? null);
        } catch {}
      }
    });
  }, []);

  // Carrega labs e reservas
  useEffect(() => {
    const load = async () => {
      try {
        setErrorMsg(null);
        const [labsRes, reservasRes] = await Promise.all([
          api.get<Lab[]>(`/labs/all`),
          api.get<Reserva[]>(`/agendamentos/all`),
        ]);
        setLabs(labsRes.data as any);
        setReservas(reservasRes.data as any);
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error);
        const base = getApiBaseUrl();
        setErrorMsg(
          error?.message === 'Network Error'
            ? `Falha de rede. Verifique se o servidor (${base}) está acessível.`
            : 'Erro ao carregar dados.'
        );
      }
    };
    load();
  }, []);

  // Recarrega reservas ao voltar para a tela
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const reload = async () => {
        try {
          const reservasRes = await api.get<Reserva[]>(`/agendamentos/all`);
          if (active) setReservas(reservasRes.data as any);
        } catch {}
      };
      reload();
      return () => { active = false; };
    }, [])
  );

  // Gera calendário do mês
  const monthGrid = useMemo(() => {
    const year = current.getFullYear();
    const month = current.getMonth();
    const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Dom
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { date: Date | null; key: string }[] = [];
    for (let i = 0; i < firstWeekDay; i++) {
      cells.push({ date: null, key: `b-${i}` });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: `d-${d}` });
    }
    // completa até múltiplo de 7
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, key: `a-${cells.length}` });
    }
    return cells;
  }, [current]);

  // Reservas do dia selecionado
  const selectedYMD = useMemo(() => formatYMD(selectedDate), [selectedDate]);
  const reservasDoDia = useMemo(
    () => reservas.filter((r) => toYMD((r as any).dia) === selectedYMD),
    [reservas, selectedYMD]
  );

  // Ocupação por laboratório (contagem de reservas no dia)
  const ocupacaoPorLab = useMemo(() => {
    const map = new Map<number, number>();
    for (const r of reservasDoDia) {
      map.set(r.id_Laboratorio, (map.get(r.id_Laboratorio) || 0) + 1);
    }
    return map;
  }, [reservasDoDia]);

  const maxOcupacao = useMemo(() => {
    let m = 0;
    ocupacaoPorLab.forEach((v) => (m = Math.max(m, v)));
    return m || 1;
  }, [ocupacaoPorLab]);

  // Meus agendamentos do dia
  const meusAgendamentos = useMemo(() => {
    if (!myUserId) return [] as Reserva[];
    return reservasDoDia.filter((r) => r.id_usuario === myUserId);
  }, [reservasDoDia, myUserId]);

  const sameYMD = (a: Date, b: Date) => formatYMD(a) === formatYMD(b);

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  const goPrevMonth = () => {
    const y = current.getFullYear();
    const m = current.getMonth();
    const newDate = new Date(y, m - 1, 1);
    setCurrent(newDate);
    // Se o mês mudou e o dia selecionado não pertence, ajusta seleção para primeiro dia do novo mês
    if (newDate.getMonth() !== selectedDate.getMonth() || newDate.getFullYear() !== selectedDate.getFullYear()) {
      setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const goNextMonth = () => {
    const y = current.getFullYear();
    const m = current.getMonth();
    const newDate = new Date(y, m + 1, 1);
    setCurrent(newDate);
    if (newDate.getMonth() !== selectedDate.getMonth() || newDate.getFullYear() !== selectedDate.getFullYear()) {
      setSelectedDate(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  };

  const onAgendar = (lab: Lab) => {
    router.push({ pathname: '/agendar', params: { labId: String(lab.id_Laboratorio), date: selectedYMD } });
  };

  return (
    <ScrollView className='flex-1 bg-black'>
      {/* background image */}
      <View style={{ width: '100%', height: '33%', position: 'absolute', top: 0, left: 0 }}>
        <Image source={require('../assets/images/bg2.jpg')} style={{ width: '100%', height: '100%' }} />
      </View>

      {/* Voltar */}
      <Link href="/" className='flex-1 flex-row items-center h-full p-16 z-10'>
        <Ionicons name="arrow-back" size={16} color="white" />
        <Text className='color-white text-xl font-poppins ml-2'>Voltar</Text>
      </Link>

      {/* Tabs */}
      <View className='flex-row items-center mx-auto rounded-full h-8 z-10 bg-white w-[90%] items-center justify-center'>
        <TouchableOpacity
          className={`w-[50%] h-8 flex items-center justify-center rounded-full ${selectedTab === 'professores' ? 'bg-[#3B96E2]' : ''}`}
          onPress={() => setSelectedTab('professores')}
        >
          <Text className={`font-poppins ${selectedTab === 'professores' ? 'color-white' : ''}`}>Professores</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`w-[50%] h-8 flex items-center justify-center rounded-full ${selectedTab === 'organizacao' ? 'bg-[#3B96E2]' : ''}`}
          onPress={() => setSelectedTab('organizacao')}
        >
          <Text className={`font-poppins ${selectedTab === 'organizacao' ? 'color-white' : ''}`}>Organização</Text>
        </TouchableOpacity>
      </View>

      {/* Calendário */}
      <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <TouchableOpacity onPress={goPrevMonth}>
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' }}>{monthLabel}</Text>
          <TouchableOpacity onPress={goNextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Cabeçalho dias da semana */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          {WEEK_LABELS.map((w) => (
            <Text key={w} style={{ color: '#9CA3AF', width: `${100 / 7}%`, textAlign: 'center' }}>{w}</Text>
          ))}
        </View>
        {/* Grade de dias */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {monthGrid.map(({ date, key }, i) => {
            if (!date) return <View key={key} style={{ width: `${100 / 7}%`, height: 40 }} />;
            const isSelected = sameYMD(date, selectedDate);
            const isToday = sameYMD(date, new Date());
            const ymd = formatYMD(date);
            const hasReserva = reservas.some((r) => toYMD((r as any).dia) === ymd);
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedDate(date)}
                style={{
                  width: `${100 / 7}%`,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  marginVertical: 2,
                  backgroundColor: isSelected ? '#1C4AED' : 'transparent',
                }}
              >
                <Text style={{ color: isSelected ? '#fff' : '#E5E7EB', fontWeight: isToday ? 'bold' as const : 'normal' }}>
                  {date.getDate()}
                </Text>
                {hasReserva ? (
                  <View style={{ width: 6, height: 6, backgroundColor: '#3B96E2', borderRadius: 3, marginTop: 2 }} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Lista de Laboratórios */}
      <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
        {errorMsg ? (
          <Text className='text-red-400 text-center mt-4'>{errorMsg}</Text>
        ) : null}
        {labs.map((lab) => {
          const count = reservasDoDia.filter((r) => r.id_Laboratorio === lab.id_Laboratorio).length;
          const percent = Math.round((count / maxOcupacao) * 100);
          return (
            <View key={lab.id_Laboratorio} style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Laboratório {lab.numero}</Text>
                  <Text style={{ color: '#9CA3AF', marginTop: 4 }}>{count} agendamentos no dia</Text>
                </View>
                <TouchableOpacity onPress={() => onAgendar(lab)} style={{ backgroundColor: '#3B96E2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Agendar</Text>
                </TouchableOpacity>
              </View>
              {/* Barra de uso relativa */}
              <View style={{ height: 6, backgroundColor: '#1F2937', borderRadius: 8, marginTop: 12, overflow: 'hidden' }}>
                <View style={{ width: `${percent}%`, height: '100%', backgroundColor: percent > 66 ? '#EF4444' : percent > 33 ? '#F59E0B' : '#10B981' }} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Meus Agendamentos */}
      <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 80 }}>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Meus Agendamentos</Text>
        {meusAgendamentos.length === 0 ? (
          <Text style={{ color: '#9CA3AF' }}>Você não possui agendamentos neste dia.</Text>
        ) : (
          meusAgendamentos.map((a) => (
            <View key={a.id_Reserva} style={{ backgroundColor: '#0F172A', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Laboratório {a.numero_laboratorio}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                <Text style={{ color: '#9CA3AF', marginLeft: 6 }}>{a.horario?.slice(0,5)}h</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Nav active="agendamento" />
    </ScrollView>
  );
}
