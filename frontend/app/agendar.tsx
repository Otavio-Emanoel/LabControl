import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nav from '@/components/nav';

// Slots fixos
const SLOTS = [
  { key: '1', title: 'Primeira Aula', start: '08:00', end: '08:50', color: '#6B8BFF' },
  { key: '2', title: 'Segunda Aula',  start: '08:50', end: '09:40', color: '#5EC2F2' },
  { key: '3', title: 'Terceira Aula', start: '10:00', end: '10:50', color: '#7F6BFF' },
  { key: '4', title: 'Quarta Aula',   start: '10:50', end: '11:40', color: '#25B97B' },
  { key: '5', title: 'Quinta Aula',   start: '11:40', end: '12:30', color: '#1FB38C' },
  { key: '6', title: 'Sexta Aula',    start: '12:30', end: '13:30', color: '#F97316' },
  { key: '7', title: 'Sétima Aula',   start: '13:30', end: '14:20', color: '#EF4444' },
  { key: '8', title: 'Oitava Aula',   start: '14:20', end: '15:10', color: '#E11D48' },
  { key: '9', title: 'Última Aula',   start: '15:10', end: '16:00', color: '#7C3AED' },
] as const;

interface Reserva {
  id_Reserva: number;
  horario: string; // HH:mm:ss
  dia: string; // YYYY-MM-DD
  id_Laboratorio: number;
}

interface Lab {
  id_Laboratorio: number;
  numero: string;
}

interface ProfDiscRow {
  id_usuario: number;
  nome_professor: string;
  id_disciplina: number;
  nome_disciplina: string;
}

// Converte valor de dia (Date ou string) para 'YYYY-MM-DD'
function toYMD(dia: unknown): string {
  if (typeof dia === 'string') return dia.slice(0, 10);
  if (dia && typeof dia === 'object' && typeof (dia as any).getFullYear === 'function') {
    const dt = dia as Date;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const dt = new Date(dia as any);
  if (isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Converte TIME do backend para 'HH:mm'
function timeToHHmm(v: unknown): string {
  if (typeof v === 'string') {
    // exemplos: '08:00:00', '08:00'
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

export default function AgendarLabPage() {
  const params = useLocalSearchParams<{ labId?: string; date?: string }>();
  const labId = Number(params.labId);
  const date = (params.date as string) || new Date().toISOString().slice(0, 10);

  const [lab, setLab] = useState<Lab | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dados do usuário
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [myCargo, setMyCargo] = useState<string | null>(null);

  // Formulário
  const [showForm, setShowForm] = useState(false);
  const [slotToSchedule, setSlotToSchedule] = useState<string | null>(null); // HH:mm
  const [selectedProfessor, setSelectedProfessor] = useState<number | null>(null);
  const [selectedDisciplina, setSelectedDisciplina] = useState<number | null>(null);
  const [justificativa, setJustificativa] = useState<string>('');

  // Para admins
  const [profDisc, setProfDisc] = useState<ProfDiscRow[]>([]);

  const isAdmin = useMemo(() => myCargo === 'Coordenador' || myCargo === 'Auxiliar_Docente', [myCargo]);

  // Carrega informações do usuário logado
  useEffect(() => {
    AsyncStorage.getItem('auth_user').then((s) => {
      if (!s) return;
      try {
        const u = JSON.parse(s);
        setMyUserId(u?.id_usuario ?? null);
        setMyCargo(u?.cargo ?? null);
      } catch {}
    });
  }, []);

  // Carrega professores/disciplinas se admin
  useEffect(() => {
    const loadProfDisc = async () => {
      if (!isAdmin) return;
      try {
        const res = await api.get<ProfDiscRow[]>(`/auth/professores-disciplinas`);
        setProfDisc(res.data as any);
      } catch (e) {
        console.log('Falha ao carregar professores/disciplinas', e);
      }
    };
    loadProfDisc();
  }, [isAdmin]);

  // Carrega informações do lab e reservas
  useEffect(() => {
    const load = async () => {
      try {
        setErrorMsg(null);
        const [labsRes, reservasRes] = await Promise.all([
          api.get<Lab[]>(`/labs/all`),
          api.get<Reserva[]>(`/agendamentos/all`),
        ]);
        const found = (labsRes.data as any as Lab[]).find((l) => l.id_Laboratorio === labId) || null;
        setLab(found);
        const all = reservasRes.data as any as Reserva[];
        setReservas(all.filter((r: any) => r.id_Laboratorio === labId && toYMD(r.dia) === date));
      } catch (e: any) {
        setErrorMsg(e?.message || 'Erro ao carregar dados.');
      }
    };
    if (labId) load();
  }, [labId, date]);

  const reservedTimes = useMemo(() => new Set(reservas.map((r) => timeToHHmm((r as any).horario))), [reservas]);
  const usagePercent = Math.round((reservas.length / SLOTS.length) * 100);

  const openForm = (startHHmm: string) => {
    setErrorMsg(null);
    setSlotToSchedule(startHHmm);
    // Se já está reservado, não abre form
    if (reservedTimes.has(startHHmm)) return;
    // define professor conforme cargo
    if (isAdmin) {
      setSelectedProfessor(null);
    } else {
      setSelectedProfessor(myUserId ?? null);
    }
    setSelectedDisciplina(null);
    setJustificativa('');
    setShowForm(true);
  };

  const submitReserva = async () => {
    if (!slotToSchedule) return;
    const fk_usuario = isAdmin ? selectedProfessor : myUserId;
    if (!fk_usuario) {
      setErrorMsg('Selecione um professor.');
      return;
    }
    try {
      setSavingSlot(slotToSchedule);
      setErrorMsg(null);
      await api.post('/agendamentos/new', {
        horario: `${slotToSchedule}:00`,
        dia: date,
        fk_aulas: selectedDisciplina ?? null,
        justificativa: justificativa || null,
        fk_laboratorio: labId,
        fk_usuario,
      });
      // Recarrega reservas do backend para refletir imediatamente e evitar divergências de tipos
      const reservasRes = await api.get<Reserva[]>(`/agendamentos/all`);
      const all = reservasRes.data as any as Reserva[];
      setReservas(all.filter((r: any) => r.id_Laboratorio === labId && toYMD(r.dia) === date));
      setShowForm(false);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || e?.message || 'Erro ao agendar.');
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-black">
      {/* Voltar */}
      <Link href="/agendamento" className='flex-1 flex-row items-center h-full p-4 z-10'>
        <Ionicons name="arrow-back" size={18} color="white" />
        <Text className='color-white text-lg font-poppins ml-2'>Voltar</Text>
      </Link>

      {/* Header do Lab */}
      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Laboratório {lab?.numero ?? labId}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 4, borderColor: '#3B96E2' }} />
          <Text style={{ color: '#9CA3AF', marginLeft: 10 }}>{usagePercent}% em uso</Text>
        </View>
        <Text style={{ color: '#9CA3AF', marginTop: 4 }}>Dia {date}</Text>
        {errorMsg ? <Text style={{ color: '#F87171', marginTop: 8 }}>{errorMsg}</Text> : null}
      </View>

      {/* Lista de slots */}
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {SLOTS.map((s) => {
          const reserved = reservedTimes.has(s.start);
          return (
            <View key={s.key} style={{ backgroundColor: '#0F172A', borderRadius: 16, overflow: 'hidden' }}>
              <View style={{ height: 8, backgroundColor: s.color, opacity: 0.9 }} />
              <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>{s.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={{ color: '#9CA3AF', marginLeft: 6 }}>{s.start} - {s.end}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ backgroundColor: reserved ? '#1F2937' : '#16A34A', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>{reserved ? 'Em uso' : 'Livre'}</Text>
                  </View>
                  <TouchableOpacity
                    disabled={reserved || savingSlot === s.start}
                    onPress={() => !reserved && openForm(s.start)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: reserved ? '#374151' : '#3B96E2',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: reserved || savingSlot === s.start ? 0.6 : 1,
                    }}
                  >
                    <Ionicons name={reserved ? 'lock-closed' : 'add'} size={18} color={'white'} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Formulário de agendamento */}
      {/* Substitui bottom sheet por Modal centralizado */}
      <Modal
        visible={showForm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForm(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '92%', maxWidth: 640, backgroundColor: '#111827', borderRadius: 16, overflow: 'hidden', maxHeight: '85%' }}>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Novo Agendamento</Text>
              <Text style={{ color: '#9CA3AF', marginTop: 4 }}>Horário: {slotToSchedule} | Dia: {date}</Text>

              {isAdmin ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>Professor</Text>
                  <View style={{ backgroundColor: '#0F172A', borderRadius: 12 }}>
                    {Array.from(new Map(profDisc.map(p => [p.id_usuario, p])).values()).map((p) => (
                      <TouchableOpacity key={p.id_usuario} onPress={() => setSelectedProfessor(p.id_usuario)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#1F2937', backgroundColor: selectedProfessor === p.id_usuario ? '#1C4AED' : 'transparent' }}>
                        <Text style={{ color: 'white' }}>{p.nome_professor}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ color: '#E5E7EB', marginVertical: 6 }}>Disciplina</Text>
                  <View style={{ backgroundColor: '#0F172A', borderRadius: 12, maxHeight: 160 }}>
                    {profDisc
                      .filter((d) => !selectedProfessor || d.id_usuario === selectedProfessor)
                      .map((d) => (
                        <TouchableOpacity key={`${d.id_usuario}-${d.id_disciplina}`} onPress={() => setSelectedDisciplina(d.id_disciplina)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#1F2937', backgroundColor: selectedDisciplina === d.id_disciplina ? '#1C4AED' : 'transparent' }}>
                          <Text style={{ color: 'white' }}>{d.nome_disciplina}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: '#E5E7EB' }}>Você agendará em seu nome.</Text>
                </View>
              )}

              <View style={{ marginTop: 12 }}>
                <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>Justificativa</Text>
                <TextInput
                  placeholder="Motivo do uso do laboratório..."
                  placeholderTextColor="#6B7280"
                  style={{ backgroundColor: '#0F172A', borderRadius: 12, color: 'white', padding: 12 }}
                  value={justificativa}
                  onChangeText={setJustificativa}
                  multiline
                />
              </View>

              {errorMsg ? <Text style={{ color: '#F87171', marginTop: 8 }}>{errorMsg}</Text> : null}

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <TouchableOpacity onPress={() => setShowForm(false)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#374151' }}>
                  <Text style={{ color: 'white' }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={submitReserva} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#3B96E2' }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Agendar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Nav active="agendamento" />
    </ScrollView>
  );
}
