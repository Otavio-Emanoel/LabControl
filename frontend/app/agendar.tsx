import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Nav from '@/components/nav';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Slots fixos
const SLOTS = [
  { key: '1', title: 'Primeira Aula', start: '08:00', end: '08:50', color: '#6B8BFF' },
  { key: '2', title: 'Segunda Aula',  start: '08:50', end: '09:40', color: '#5EC2F2' },
  { key: '3', title: 'Terceira Aula', start: '10:00', end: '10:50', color: '#7F6BFF' },
  { key: '4', title: 'Quarta Aula',   start: '10:50', end: '11:40', color: '#25B97B' },
  { key: '5', title: 'Quinta Aula',   start: '11:40', end: '12:30', color: '#1FB38C' },
  { key: '6', title: 'Sexta Aula',    start: '12:30', end: '13:20', color: '#F97316' },
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

interface Curso { id_curso: number; nome: string }
interface Disciplina { id_disciplina: number; nome: string; id_curso: number }

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

// YYYY-MM-DD -> dia da semana do backend de fixos (local time, evita UTC)
function ymdToDiaSemana(ymd: string) {
  try {
    const [y, m, d] = (ymd || '').split('-').map((v) => Number(v));
    if (!y || !m || !d) return '';
    const idx = new Date(y, m - 1, d).getDay(); // local date
    const dias = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'] as const;
    return dias[idx] || '';
  } catch {
    return '';
  }
}

export default function AgendarLabPage() {
  const params = useLocalSearchParams<{ labId?: string; date?: string }>();
  const labId = Number(params.labId);
  const date = (params.date as string) || new Date().toISOString().slice(0, 10);

  const [lab, setLab] = useState<Lab | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [fixedTimes, setFixedTimes] = useState<string[]>([]); // HH:mm dos fixos para este lab e dia da semana
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
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);

  // Filtros de busca no modal
  const [profQuery, setProfQuery] = useState('');
  const [discQuery, setDiscQuery] = useState('');

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

  // Carrega professores/disciplinas se admin (vínculos)
  useEffect(() => {
    const loadProfDisc = async () => {
      try {
        const res = await api.get<ProfDiscRow[]>(`/auth/professores-disciplinas`);
        setProfDisc(res.data as any);
      } catch (e) {
        console.log('Falha ao carregar professores/disciplinas', e);
      }
    };
    loadProfDisc();
  }, []);

  // Carrega cursos e disciplinas (para exibir nome do curso ao lado da disciplina)
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [cursosRes, discRes] = await Promise.all([
          api.get<Curso[]>(`/auth/cursos`),
          api.get<Disciplina[]>(`/auth/disciplinas`),
        ]);
        setCursos((cursosRes.data as any) || []);
        setDisciplinas((discRes.data as any) || []);
      } catch (e) {
        console.log('Falha ao carregar cursos/disciplinas', e);
      }
    };
    loadMeta();
  }, []);

  const cursoById = useMemo(() => new Map(cursos.map(c => [Number(c.id_curso), c.nome])), [cursos]);
  const discToCursoId = useMemo(() => new Map(disciplinas.map(d => [Number(d.id_disciplina), Number(d.id_curso)])), [disciplinas]);
  const getCursoNomeByDisciplina = useCallback((id_disc?: number | null) => {
    if (id_disc == null) return '';
    const idCurso = discToCursoId.get(Number(id_disc));
    return idCurso ? (cursoById.get(Number(idCurso)) || '') : '';
  }, [discToCursoId, cursoById]);

  // Listas derivadas para o modal
  const professores = useMemo(() => {
    const map = new Map<number, string>();
    for (const r of profDisc) {
      map.set(Number(r.id_usuario), r.nome_professor);
    }
    return Array.from(map.entries())
      .map(([id, nome]) => ({ id_usuario: id, nome_professor: nome }))
      .sort((a, b) => a.nome_professor.localeCompare(b.nome_professor));
  }, [profDisc]);

  const filteredProfessores = useMemo(() => {
    const q = profQuery.trim().toLowerCase();
    if (!q) return professores;
    return professores.filter(p => p.nome_professor.toLowerCase().includes(q));
  }, [profQuery, professores]);

  const discForContext = useMemo(() => {
    if (isAdmin) {
      if (!selectedProfessor) return [] as (ProfDiscRow & { cursoNome?: string })[];
      return profDisc.filter(d => d.id_usuario === selectedProfessor);
    }
    return profDisc.filter(d => d.id_usuario === myUserId);
  }, [isAdmin, selectedProfessor, profDisc, myUserId]);

  const discWithCourse = useMemo(() =>
    discForContext.map(d => ({ ...d, cursoNome: getCursoNomeByDisciplina(d.id_disciplina) })),
  [discForContext, getCursoNomeByDisciplina]);

  const filteredDisciplinas = useMemo(() => {
    const q = discQuery.trim().toLowerCase();
    if (!q) return discWithCourse;
    return discWithCourse.filter(d =>
      d.nome_disciplina.toLowerCase().includes(q) || (d.cursoNome || '').toLowerCase().includes(q)
    );
  }, [discQuery, discWithCourse]);

  const selectedProfessorName = useMemo(() => {
    if (!selectedProfessor) return '';
    return professores.find(p => p.id_usuario === selectedProfessor)?.nome_professor || '';
  }, [professores, selectedProfessor]);

  const selectedDisciplinaLabel = useMemo(() => {
    if (selectedDisciplina == null) return '';
    const d = discWithCourse.find(x => x.id_disciplina === selectedDisciplina);
    if (!d) return '';
    return `${d.nome_disciplina}${d.cursoNome ? ` · ${d.cursoNome}` : ''}`;
  }, [discWithCourse, selectedDisciplina]);

  // Carrega informações do lab e reservas + horários fixos
  useEffect(() => {
    const load = async () => {
      try {
        setErrorMsg(null);
        const ds = ymdToDiaSemana(date);
        const [labsRes, reservasRes, fixosRes] = await Promise.all([
          api.get<Lab[]>(`/labs/all`),
          api.get<Reserva[]>(`/agendamentos/all`),
          api.get<any[]>(`/horarios-fixos/`),
        ]);
        const found = (labsRes.data as any as Lab[]).find((l) => l.id_Laboratorio === labId) || null;
        setLab(found);
        const all = reservasRes.data as any as Reserva[];
        const doDia = all.filter((r: any) => r.id_Laboratorio === labId && toYMD(r.dia) === date);
        setReservas(doDia);

        // mapear HH:mm de fixos deste lab e dia da semana
        let ft: string[] = [];
        if (Array.isArray(fixosRes.data) && ds) {
          ft = (fixosRes.data as any[])
            .filter((f: any) => {
              const labFromRow = Number(f?.fk_lab ?? f?.id_Laboratorio);
              const dia = String(f?.dia_semana || '').toLowerCase();
              return labFromRow === Number(labId) && dia === ds;
            })
            .map((f: any) => timeToHHmm(f.horario));
        }
        setFixedTimes(ft);
      } catch (e: any) {
        setErrorMsg(e?.message || 'Erro ao carregar dados.');
      }
    };
    if (labId) load();
  }, [labId, date]);

  const reservedTimes = useMemo(() => {
    const set = new Set<string>(reservas.map((r) => timeToHHmm((r as any).horario)));
    for (const t of fixedTimes) set.add(t);
    return set;
  }, [reservas, fixedTimes]);

  const usagePercent = useMemo(() => {
    const distinct = new Set<string>();
    for (const r of reservas) distinct.add(timeToHHmm((r as any).horario));
    for (const t of fixedTimes) distinct.add(t);
    return Math.round((distinct.size / SLOTS.length) * 100);
  }, [reservas, fixedTimes]);

  const openForm = (startHHmm: string) => {
    setErrorMsg(null);
    setSlotToSchedule(startHHmm);
    // Se já está reservado (inclui fixos), não abre form
    if (reservedTimes.has(startHHmm)) return;
    // define professor conforme cargo
    if (isAdmin) {
      setSelectedProfessor(null);
      setSelectedDisciplina(null);
    } else {
      setSelectedProfessor(myUserId ?? null);
      // auto-seleciona a primeira disciplina vinculada ao professor (normalizando tipos)
      const userIdNum = Number(myUserId ?? NaN);
      const firstDisc = profDisc.find((d) => Number(d.id_usuario) === userIdNum);
      setSelectedDisciplina(firstDisc ? Number(firstDisc.id_disciplina) : null);
    }
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

    // Validação específica para Professor: deve escolher disciplina e estar vinculado a ela
    if (myCargo === 'Professor') {
      if (selectedDisciplina == null) {
        setErrorMsg('Selecione uma disciplina.');
        return;
      }
      const allowed = profDisc.some(
        (d) => Number(d.id_usuario) === Number(myUserId) && Number(d.id_disciplina) === Number(selectedDisciplina)
      );
      if (!allowed) {
        setErrorMsg('Professor não vinculado à disciplina selecionada.');
        return;
      }
    }

    try {
      setSavingSlot(slotToSchedule);
      setErrorMsg(null);
      await api.post('/agendamentos/new', {
        horario: `${slotToSchedule}:00`,
        dia: date,
        fk_aulas: selectedDisciplina != null ? Number(selectedDisciplina) : null,
        justificativa: justificativa || null,
        fk_laboratorio: labId,
        fk_usuario,
      });
      // Recarrega reservas do backend para refletir imediatamente
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

  // Insets de área segura (topo)
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black', paddingTop: Math.max(insets.top, 12) }}>
      <ScrollView className="flex-1 bg-black" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 96 }}>
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
            const isFixed = fixedTimes.includes(s.start);
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
                      <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>{reserved ? (isFixed ? 'Fixo' : 'Em uso') : 'Livre'}</Text>
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
        <Modal
          visible={showForm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowForm(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <View style={{ width: '92%', maxWidth: 640, backgroundColor: '#111827', borderRadius: 18, overflow: 'hidden', height: '85%', borderWidth: 1, borderColor: '#374151' }}>
              {/* Header do modal */}
              <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F2937', flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A' }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, flex: 1 }}>Novo Agendamento</Text>
                <TouchableOpacity onPress={() => setShowForm(false)} style={{ padding: 6, borderRadius: 8, backgroundColor: '#111827' }}>
                  <Text style={{ color: '#9CA3AF', fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
                  <Text style={{ color: '#9CA3AF' }}>Horário: <Text style={{ color: 'white' }}>{slotToSchedule}</Text>  |  Dia: <Text style={{ color: 'white' }}>{date}</Text></Text>

                  {/* Chips de seleção */}
                  {(selectedProfessor || selectedDisciplina != null) && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      {selectedProfessor ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2A44', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                          <Text style={{ color: '#93C5FD' }}>👤</Text>
                          <Text style={{ color: 'white', marginLeft: 6 }}>{selectedProfessorName}</Text>
                          <TouchableOpacity onPress={() => { setSelectedProfessor(null); setSelectedDisciplina(null); }} style={{ marginLeft: 8 }}>
                            <Text style={{ color: '#9CA3AF' }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      {selectedDisciplina != null ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2A44', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                          <Text style={{ color: '#93C5FD' }}>📘</Text>
                          <Text style={{ color: 'white', marginLeft: 6 }}>{selectedDisciplinaLabel}</Text>
                          <TouchableOpacity onPress={() => setSelectedDisciplina(null)} style={{ marginLeft: 8 }}>
                            <Text style={{ color: '#9CA3AF' }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  )}

                  {isAdmin ? (
                    <View style={{ marginTop: 16 }}>
                      {/* Professor */}
                      <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>Professor</Text>
                      <View style={{ backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                        <TextInput
                          placeholder="Buscar professor..."
                          placeholderTextColor="#6B7280"
                          value={profQuery}
                          onChangeText={setProfQuery}
                          style={{ color: 'white', padding: 12 }}
                        />
                        <View style={{ height: 220, borderTopWidth: 1, borderTopColor: '#1F2937' }}>
                          <ScrollView nestedScrollEnabled>
                            {filteredProfessores.length === 0 ? (
                              <Text style={{ color: '#9CA3AF', padding: 12 }}>Nenhum professor encontrado.</Text>
                            ) : (
                              filteredProfessores.map((item) => (
                                <TouchableOpacity
                                  key={String(item.id_usuario)}
                                  onPress={() => { setSelectedProfessor(item.id_usuario); setSelectedDisciplina(null); }}
                                  style={{ padding: 12, backgroundColor: selectedProfessor === item.id_usuario ? '#1C4AED' : 'transparent' }}
                                >
                                  <Text style={{ color: 'white' }}>{item.nome_professor}</Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </ScrollView>
                        </View>
                      </View>

                      {/* Disciplina */}
                      <Text style={{ color: '#E5E7EB', marginTop: 16, marginBottom: 6 }}>Disciplina</Text>
                      {!selectedProfessor ? (
                        <Text style={{ color: '#9CA3AF' }}>Selecione um professor para listar as disciplinas.</Text>
                      ) : (
                        <View style={{ backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                          <TextInput
                            placeholder="Buscar disciplina ou curso..."
                            placeholderTextColor="#6B7280"
                            value={discQuery}
                            onChangeText={setDiscQuery}
                            style={{ color: 'white', padding: 12 }}
                          />
                          <View style={{ height: 220, borderTopWidth: 1, borderTopColor: '#1F2937' }}>
                            <ScrollView nestedScrollEnabled>
                              {filteredDisciplinas.length === 0 ? (
                                <Text style={{ color: '#9CA3AF', padding: 12 }}>Nenhuma disciplina para o professor selecionado.</Text>
                              ) : (
                                filteredDisciplinas.map((item) => (
                                  <TouchableOpacity
                                    key={`${item.id_usuario}-${item.id_disciplina}`}
                                    onPress={() => setSelectedDisciplina(item.id_disciplina)}
                                    style={{ padding: 12, backgroundColor: selectedDisciplina === item.id_disciplina ? '#1C4AED' : 'transparent' }}
                                  >
                                    <Text style={{ color: 'white' }}>{item.nome_disciplina}{item.cursoNome ? ` · ${item.cursoNome}` : ''}</Text>
                                  </TouchableOpacity>
                                ))
                              )}
                            </ScrollView>
                          </View>
                        </View>
                      )}
                    </View>
                  ) : (
                    // Professor
                    <View style={{ marginTop: 16 }}>
                      <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>Sua disciplina</Text>
                      <View style={{ backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#1F2937' }}>
                        <TextInput
                          placeholder="Buscar disciplina ou curso..."
                          placeholderTextColor="#6B7280"
                          value={discQuery}
                          onChangeText={setDiscQuery}
                          style={{ color: 'white', padding: 12 }}
                        />
                        <View style={{ height: 220, borderTopWidth: 1, borderTopColor: '#1F2937' }}>
                          <ScrollView nestedScrollEnabled>
                            {filteredDisciplinas.length === 0 ? (
                              <Text style={{ color: '#9CA3AF', padding: 12 }}>Você não possui disciplinas vinculadas.</Text>
                            ) : (
                              filteredDisciplinas.map((item) => (
                                <TouchableOpacity
                                  key={`${item.id_usuario}-${item.id_disciplina}`}
                                  onPress={() => { setSelectedDisciplina(item.id_disciplina); setErrorMsg(null); }}
                                  style={{ padding: 12, backgroundColor: selectedDisciplina === item.id_disciplina ? '#1C4AED' : 'transparent' }}
                                >
                                  <Text style={{ color: 'white' }}>{item.nome_disciplina}{item.cursoNome ? ` · ${item.cursoNome}` : ''}</Text>
                                </TouchableOpacity>
                              ))
                            )}
                          </ScrollView>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Justificativa (opcional) */}
                  <View style={{ marginTop: 16 }}>
                    <Text style={{ color: '#E5E7EB', marginBottom: 6 }}>Justificativa (opcional)</Text>
                    <TextInput
                      placeholder="Ex.: Aula prática, reposição, etc."
                      placeholderTextColor="#6B7280"
                      value={justificativa}
                      onChangeText={setJustificativa}
                      style={{ color: 'white', backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#1F2937', borderRadius: 12, padding: 12 }}
                    />
                  </View>

                  {/* Ações */}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
                    <TouchableOpacity onPress={() => setShowForm(false)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#374151' }}>
                      <Text style={{ color: 'white' }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={submitReserva} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#3B96E2' }}>
                      <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Nav fixa */}
      <Nav active="agendamento" />
    </SafeAreaView>
  );
}
