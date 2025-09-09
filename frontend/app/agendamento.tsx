import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, Image, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, getApiBaseUrl } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
  fk_aulas?: number | null;
  nome_disciplina?: string | null;
  id_usuario: number;
  nome_usuario: string;
  id_Laboratorio: number;
  numero_laboratorio: string;
  // extras quando for horário fixo mapeado
  isFixo?: boolean;
  id_fixo?: number;
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

function addMinutesHHmm(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(0, 0, 0, h || 0, m || 0, 0);
  d.setMinutes(d.getMinutes() + minutes);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function timeToHHmm(v: unknown): string {
  if (typeof v === 'string') {
    const m = v.match(/^(\d{2}:\d{2})/);
    return m ? m[1] : '';
  }
  if (v && typeof v === 'object' && typeof (v as any).getHours === 'function') {
    const dt = v as Date;
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  return '';
}

function ymdToDiaSemana(ymd: string) {
  try {
    const d = new Date(`${ymd}T00:00:00`);
    const idx = d.getDay(); // 0..6
    const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'] as const;
    return dias[idx];
  } catch {
    return '';
  }
}

export default function AgendamentoPage() {
  const router = useRouter();
  // const [selectedTab, setSelectedTab] = useState<'professores' | 'organizacao'>('professores');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fixos, setFixos] = useState<any[]>([]);
  const [cargo, setCargo] = useState<string>('');
  const isAuxCoord = cargo === 'Coordenador' || cargo === 'Auxiliar_Docente' || (typeof cargo === 'string' && /(coordenador|auxiliar)/i.test(cargo));

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [current, setCurrent] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [editJustificativa, setEditJustificativa] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useAuthGuard();

  // Carrega usuário do storage
  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((s) => {
      if (s) {
        try {
          const u = JSON.parse(s);
          setMyUserId(u?.id_usuario ?? null);
          if (u?.cargo) setCargo(u.cargo);
        } catch {}
      }
    });
  }, []);

  // Fallback: checa cargo via API
  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ user?: { cargo?: string } }>(`/auth/me`);
        const c = me.data?.user?.cargo;
        if (c) setCargo(c);
      } catch {}
    })();
  }, []);

  // Carrega labs, reservas e fixos
  useEffect(() => {
    const load = async () => {
      try {
        setErrorMsg(null);
        const [labsRes, reservasRes, fixosRes] = await Promise.all([
          api.get<Lab[]>(`/labs/all`),
          api.get<Reserva[]>(`/agendamentos/all`),
          api.get<any[]>(`/horarios-fixos/`),
        ]);
        setLabs(labsRes.data as any);
        setReservas(reservasRes.data as any);
        setFixos(Array.isArray(fixosRes.data) ? (fixosRes.data as any[]) : []);
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
          const [reservasRes, fixosRes] = await Promise.all([
            api.get<Reserva[]>(`/agendamentos/all`),
            api.get<any[]>(`/horarios-fixos/`),
          ]);
          if (active) {
            setReservas(reservasRes.data as any);
            setFixos(Array.isArray(fixosRes.data) ? (fixosRes.data as any[]) : []);
          }
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

  const selectedYMD = useMemo(() => formatYMD(selectedDate), [selectedDate]);

  // Fixos do dia selecionado mapeados para pseudo-reservas
  const fixosDoDia = useMemo(() => {
    const ds = ymdToDiaSemana(selectedYMD);
    if (!ds) return [] as Reserva[];
    return (fixos || [])
      .filter((f) => String(f.dia_semana).toLowerCase() === ds)
      .map((f) => {
        const numeroLab = f.nome_laboratorio ?? f.numero_laboratorio ?? f.numero ?? '';
        return {
          id_Reserva: -200000 - Number(f.id_horario_fixo || 0),
          id_fixo: Number(f.id_horario_fixo || 0),
          isFixo: true,
          horario: String(f.horario),
          dia: selectedYMD,
          // justificativa não se aplica para fixo
          justificativa: undefined,
          fk_aulas: null,
          nome_disciplina: null,
          id_usuario: Number(f.id_usuario),
          nome_usuario: String(f.nome_usuario || ''),
          id_Laboratorio: Number(f.id_Laboratorio),
          numero_laboratorio: String(numeroLab),
        } as Reserva;
      });
  }, [fixos, selectedYMD]);

  // Reservas do dia selecionado (normais)
  const reservasDoDiaNormais = useMemo(
    () => reservas.filter((r) => toYMD((r as any).dia) === selectedYMD),
    [reservas, selectedYMD]
  );

  // Combina: reservas do dia têm prioridade sobre fixos em caso de conflito (lab+horário)
  const reservasDoDia = useMemo(() => {
    const ocupados = new Set(reservasDoDiaNormais.map((r) => `${r.id_Laboratorio}-${timeToHHmm(r.horario)}`));
    const fixosSemConflito = fixosDoDia.filter((f) => !ocupados.has(`${f.id_Laboratorio}-${timeToHHmm(f.horario)}`));
    return [...reservasDoDiaNormais, ...fixosSemConflito];
  }, [reservasDoDiaNormais, fixosDoDia]);

  // Ocupação por laboratório (contagem de reservas no dia, incluindo fixos)
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

  // Meus agendamentos do dia (inclui fixos)
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
    const ymd = selectedYMD;
    router.push({ pathname: '/agendar', params: { labId: String(lab.id_Laboratorio), date: ymd } });
  };

  // Ações de edição/exclusão
  const openEdit = (r: Reserva) => {
    if (r.isFixo) {
      Alert.alert('Não editável', 'Horários fixos não possuem justificativa para edição.');
      return;
    }
    setSelectedReserva(r);
    setEditJustificativa(r.justificativa || '');
    setEditModalVisible(true);
  };
  const openDelete = (r: Reserva) => {
    if (r.isFixo && !isAuxCoord) {
      Alert.alert('Ação não permitida', 'Apenas Coordenador ou Auxiliar Docente podem remover horários fixos.');
      return;
    }
    setSelectedReserva(r);
    setDeleteModalVisible(true);
  };
  const confirmEdit = async () => {
    if (!selectedReserva) return;
    try {
      setSavingEdit(true);
      await api.post(`/agendamentos/justificativa/${selectedReserva.id_Reserva}`, { justificativa: editJustificativa });
      // Atualiza localmente para refletir de imediato
      setReservas((prev) => prev.map((x) => x.id_Reserva === selectedReserva.id_Reserva ? { ...x, justificativa: editJustificativa } : x));
      setEditModalVisible(false);
      setSelectedReserva(null);
    } catch (e) {
      console.error('Erro ao editar justificativa', e);
    } finally {
      setSavingEdit(false);
    }
  };
  const confirmDelete = async () => {
    if (!selectedReserva) return;
    try {
      setDeleting(true);
      if (selectedReserva.isFixo) {
        // remover horário fixo
        await api.delete(`/horarios-fixos/${selectedReserva.id_fixo}`);
      } else {
        await api.post(`/agendamentos/delete/${selectedReserva.id_Reserva}`);
      }
      // Atualiza listas locais mínimas
      if (!selectedReserva.isFixo) {
        setReservas((prev) => prev.filter((x) => x.id_Reserva !== selectedReserva.id_Reserva));
      }
      setDeleteModalVisible(false);
      setSelectedReserva(null);
      // Recarrega fixos/reservas para refletir estado
      try {
        const [reservasRes, fixosRes] = await Promise.all([
          api.get<Reserva[]>(`/agendamentos/all`),
          api.get<any[]>(`/horarios-fixos/`),
        ]);
        setReservas(reservasRes.data as any);
        setFixos(Array.isArray(fixosRes.data) ? (fixosRes.data as any[]) : []);
      } catch {}
    } catch (e) {
      console.error('Erro ao deletar agendamento', e);
    } finally {
      setDeleting(false);
    }
  };
  const closeModals = () => {
    setEditModalVisible(false);
    setDeleteModalVisible(false);
    setSelectedReserva(null);
  };

  return (
    <View className='flex-1 bg-black'>
      <ScrollView className='flex-1' contentContainerStyle={{ paddingBottom: 104 }}>
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
        {/* <View className='flex-row items-center mx-auto rounded-full h-8 z-10 bg-white w-[90%] items-center justify-center'>
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
        </View> */}

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
              const hasReserva = reservas.some((r) => toYMD((r as any).dia) === ymd) || (function(){
                const ds = ymdToDiaSemana(ymd);
                return (fixos || []).some((f) => String(f.dia_semana).toLowerCase() === ds);
              })();
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
        <View style={{ paddingHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 8 }}>Meus Agendamentos</Text>
          {meusAgendamentos.length === 0 ? (
            <Text style={{ color: '#9CA3AF' }}>Você não possui agendamentos neste dia.</Text>
          ) : (
            meusAgendamentos.map((a, idx) => {
              const start = (a.horario || '').slice(0, 5);
              const end = start ? addMinutesHHmm(start, 50) : '';
              const timeRange = start && end ? `${start} - ${end}` : start ? `${start}` : '';
              const gradients = [
                ['#1C4AED', '#7C3AED'],
                ['#2563EB', '#1C4AED'],
                ['#0EA5E9', '#2563EB'],
              ] as const;
              const colors = gradients[idx % gradients.length] as readonly [string, string];
              const isFixo = !!a.isFixo;
              const canDelete = isFixo ? isAuxCoord : true;
              return (
                <LinearGradient
                  key={`${a.id_Reserva}`}
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Laboratório {a.numero_laboratorio}</Text>
                        {isFixo ? (
                          <View style={{ backgroundColor: '#064e3b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                            <Text style={{ color: '#34D399', fontWeight: '800', fontSize: 10 }}>FIXO</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={{ color: '#E5E7EB', marginTop: 4 }} numberOfLines={2}>
                        {isFixo ? 'Horário fixo' : (a.nome_disciplina ? `Aula de ${a.nome_disciplina}` : a.justificativa ? a.justificativa : 'Agendamento')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity onPress={() => openEdit(a)} disabled={isFixo} style={{ backgroundColor: '#ffffff22', padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff33', opacity: isFixo ? 0.4 : 1 }}>
                        <Ionicons name="create-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openDelete(a)} disabled={!canDelete} style={{ backgroundColor: '#ffffff22', padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#ffffff33', opacity: !canDelete ? 0.4 : 1 }}>
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 12 }}>
                    <Ionicons name="time-outline" size={14} color="#fff" />
                    <Text style={{ color: '#fff', marginLeft: 6 }}>{timeRange} {timeRange && 'h'}</Text>
                  </View>
                </LinearGradient>
              );
            })
          )}
        </View>

        {/* Modal Editar Justificativa */}
        <Modal visible={editModalVisible} animationType="fade" transparent onRequestClose={closeModals}>
          <View style={{ flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <View style={{ width: '100%', backgroundColor: '#0F1115', borderRadius: 16, padding: 16 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Editar justificativa</Text>
              <TextInput
                placeholder="Ex: Desenvolvimento de Sistemas"
                placeholderTextColor="#9CA3AF"
                value={editJustificativa}
                onChangeText={setEditJustificativa}
                style={{ backgroundColor: '#111827', color: 'white', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={closeModals} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                  <Text style={{ color: '#9CA3AF' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmEdit} disabled={savingEdit} style={{ backgroundColor: '#3B96E2', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, opacity: savingEdit ? 0.7 : 1 }}>
                  {savingEdit ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Salvar</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal Confirmar Exclusão */}
        <Modal visible={deleteModalVisible} animationType="fade" transparent onRequestClose={closeModals}>
          <View style={{ flex: 1, backgroundColor: '#00000088', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <View style={{ width: '100%', backgroundColor: '#0F1115', borderRadius: 16, padding: 16 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, marginBottom: 4 }}>{selectedReserva?.isFixo ? 'Remover horário fixo' : 'Remover agendamento'}</Text>
              <Text style={{ color: '#9CA3AF' }}>Tem certeza que deseja excluir {selectedReserva?.isFixo ? 'este horário fixo' : 'este agendamento'}?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
                <TouchableOpacity onPress={closeModals} style={{ paddingVertical: 10, paddingHorizontal: 14, marginRight: 8 }}>
                  <Text style={{ color: '#9CA3AF' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDelete} disabled={deleting} style={{ backgroundColor: selectedReserva?.isFixo ? '#B91C1C' : '#EF4444', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, opacity: deleting ? 0.7 : 1 }}>
                  {deleting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '600' }}>{selectedReserva?.isFixo ? 'Remover fixo' : 'Excluir'}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Nav active="agendamento" />
    </View>
  );
}
