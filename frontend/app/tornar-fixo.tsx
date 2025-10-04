import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectionBadge from '@/components/ConnectionBadge';

// Tipos
interface Lab { id_Laboratorio: number; numero: string; }
interface Disciplina { id_disciplina: number; nome: string; id_curso?: number }
interface Professor { id_usuario: number; nome: string; cargo?: string; }
interface ProfDisc { id_usuario: number; id_disciplina: number; }
interface Fixo { id_horario_fixo: number; dia_semana: string; horario: string; id_usuario: number; nome_usuario: string; id_Laboratorio: number; nome_laboratorio: string; }
interface Curso { id_curso: number; nome: string }

const WEEKDAYS = [
  { value: 'domingo', label: 'Dom' },
  { value: 'segunda', label: 'Seg' },
  { value: 'terca', label: 'Ter' },
  { value: 'quarta', label: 'Qua' },
  { value: 'quinta', label: 'Qui' },
  { value: 'sexta', label: 'Sex' },
  { value: 'sabado', label: 'Sáb' },
];

const TIMES = ['08:00:00','08:50:00','10:00:00','10:50:00','11:40:00','12:30:00','13:30:00','14:20:00','15:10:00'];
const tlabel = (t: string) => t.slice(0,5);

export default function TornarFixoScreen() {
  const router = useRouter();
  const { ready } = useAuthGuard();

  const [cargo, setCargo] = useState<string>('');

  // selections
  const [weekday, setWeekday] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [labId, setLabId] = useState<number | null>(null);
  const [profId, setProfId] = useState<number | null>(null);
  const [discId, setDiscId] = useState<number | null>(null);

  // datasets
  const [labs, setLabs] = useState<Lab[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [profDisc, setProfDisc] = useState<ProfDisc[]>([]);
  const [fixos, setFixos] = useState<Fixo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  // loading flags
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // filters
  const [profQuery, setProfQuery] = useState('');
  const [discQuery, setDiscQuery] = useState('');

  const autorizado = cargo === 'Auxiliar_Docente' || cargo === 'Coordenador';

  useEffect(() => {
    if (!ready) return;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('auth_user');
        if (stored) {
          const u = JSON.parse(stored);
          setCargo(u?.cargo || '');
        }
      } catch {}
      try {
        const [labsRes, discRes, profRes, mapRes, cursosRes, fixosRes] = await Promise.all([
          api.get<Lab[]>('/labs/all'),
          api.get<Disciplina[]>('/auth/disciplinas'),
          api.get<Professor[]>('/auth/professores'),
          api.get<ProfDisc[]>('/auth/professores-disciplinas'),
          api.get<Curso[]>('/auth/cursos'),
          api.get<Fixo[]>('/horarios-fixos/'),
        ]);
        setLabs(labsRes.data as any);
        setDisciplinas(discRes.data as any);
        setProfessores(profRes.data as any);
        setProfDisc(mapRes.data as any);
        setCursos(cursosRes.data as any);
        setFixos(fixosRes.data as any);
      } catch (e) {
        console.log('Falha ao carregar dados', e);
      } finally {
        setLoadingPage(false);
      }
    })();
  }, [ready]);

  // Ao trocar professor, limpa disciplina selecionada
  useEffect(() => { setDiscId(null); }, [profId]);

  const filteredProfs = useMemo(() => {
    const q = profQuery.trim().toLowerCase();
    if (!q) return professores;
    return professores.filter(p => (p.nome || '').toLowerCase().includes(q));
  }, [professores, profQuery]);

  const filteredDiscs = useMemo(() => {
    const q = discQuery.trim().toLowerCase();
    if (!profId) return [] as Disciplina[]; // só mostra após escolher professor
    const idsVinculados = new Set(profDisc.filter(pd => pd.id_usuario === profId).map(pd => pd.id_disciplina));
    return disciplinas
      .filter(d => idsVinculados.has(d.id_disciplina))
      .filter(d => (d.nome || '').toLowerCase().includes(q));
  }, [disciplinas, discQuery, profDisc, profId]);

  const isLinked = (uid?: number|null, did?: number|null) => {
    if (!uid || !did) return true; // disciplina opcional
    return profDisc.some(pd => pd.id_usuario === uid && pd.id_disciplina === did);
  };

  const refreshFixos = async () => {
    try {
      const r = await api.get<Fixo[]>('/horarios-fixos/');
      setFixos(r.data as any);
    } catch (e) {
      console.log('Falha ao atualizar fixos', e);
    }
  };

  const criarFixo = async () => {
    if (!autorizado) return Alert.alert('Acesso negado', 'Apenas Coordenador ou Auxiliar Docente.');
    if (!weekday || !time || !labId || !profId) return Alert.alert('Campos obrigatórios', 'Selecione dia da semana, horário, laboratório e professor.');
    if (!TIMES.includes(time)) return Alert.alert('Horário inválido', 'Selecione um horário permitido.');
    if (discId && !isLinked(profId, discId)) return Alert.alert('Vínculo inválido', 'Professor não vinculado à disciplina selecionada.');
    try {
      setSaving(true);
      await api.post('/horarios-fixos/', { dia_semana: weekday, horario: time, fk_lab: labId, fk_usuario: profId });
      Alert.alert('Sucesso', 'Horário fixo criado.');
      await refreshFixos();
      // mantém seleção de filtros
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Falha ao criar horário fixo.';
      Alert.alert('Erro', String(msg));
    } finally {
      setSaving(false);
    }
  };

  const removerFixo = async (id: number) => {
    if (!autorizado) return;
    Alert.alert('Remover horário fixo', 'Deseja remover este horário fixo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          setDeleting(id);
          await api.delete(`/horarios-fixos/${id}`);
          await refreshFixos();
        } catch (e: any) {
          Alert.alert('Erro', String(e?.response?.data?.error || 'Falha ao remover.'));
        } finally { setDeleting(null); }
      }},
    ]);
  };

  const fixosFiltrados = useMemo(() => {
    return fixos.filter(f => (!weekday || f.dia_semana === weekday) && (!labId || f.id_Laboratorio === labId));
  }, [fixos, weekday, labId]);

  if (!ready) return <View className="flex-1 bg-black" />;

  if (!autorizado) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-lg text-center">Acesso restrito a Coordenador ou Auxiliar Docente.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 rounded-xl bg-[#1C4AED]">
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>

      <View className="flex-1 bg-black">
        {/* Topo */}
        <View className="px-6 pt-16">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Horários fixos</Text>
          </View>
        </View>

        {loadingPage ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator color="#fff" /></View>
        ) : (
          <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 140 }}>
            {/* Formulário estilo agendamento */}
            <View className="bg-[#0B1220] border border-[#111827] rounded-2xl p-4 mt-2">
              <Text className="text-white font-semibold mb-3">Criar horário fixo</Text>
              {/* Dia da semana */}
              <Text className="text-white/70 mb-2">Dia da semana</Text>
              <View className="flex-row flex-wrap gap-2">
                {WEEKDAYS.map(d => (
                  <TouchableOpacity key={d.value} onPress={() => setWeekday(d.value)} className={`px-3 py-2 rounded-full ${weekday===d.value? 'bg-[#1C4AED]':'bg-[#1F2937]'}`}>
                    <Text className={weekday===d.value? 'text-white':'text-white/80'}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Horário */}
              <Text className="text-white/70 mt-4 mb-2">Horário</Text>
              <View className="flex-row flex-wrap gap-2">
                {TIMES.map(h => (
                  <TouchableOpacity key={h} onPress={() => setTime(h)} className={`px-3 py-2 rounded-full ${time===h? 'bg-[#1C4AED]':'bg-[#1F2937]'}`}>
                    <Text className={time===h? 'text-white':'text-white/80'}>{tlabel(h)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Laboratório */}
              <Text className="text-white/70 mt-4 mb-2">Laboratório</Text>
              <View className="flex-row flex-wrap gap-2">
                {labs.map(l => (
                  <TouchableOpacity key={l.id_Laboratorio} onPress={() => setLabId(l.id_Laboratorio)} className={`px-3 py-2 rounded-full ${labId===l.id_Laboratorio? 'bg-[#1C4AED]':'bg-[#1F2937]'}`}>
                    <Text className={labId===l.id_Laboratorio? 'text-white':'text-white/80'}>Lab {l.numero}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Professor */}
              <Text className="text-white/70 mt-4 mb-2">Professor</Text>
              <View className="bg-[#0F172A] rounded-xl p-3 border border-[#111827]">
                <TextInput
                  placeholder="Buscar professor"
                  placeholderTextColor="#9CA3AF"
                  value={profQuery}
                  onChangeText={setProfQuery}
                  className="text-white mb-2"
                />
                <View className="max-h-56">
                  <ScrollView>
                    {filteredProfs.map(p => (
                      <TouchableOpacity key={p.id_usuario} onPress={() => setProfId(p.id_usuario)} className={`px-3 py-2 rounded-lg mb-2 ${profId===p.id_usuario? 'bg-[#1C4AED]':'bg-[#111827]'}`}>
                        <Text className={profId===p.id_usuario? 'text-white':'text-white/80'}>{p.nome}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Disciplina (opcional) */}
              <Text className="text-white/70 mt-4 mb-2">Disciplina (opcional)</Text>
              <View className="bg-[#0F172A] rounded-xl p-3 border border-[#111827]">
                <TextInput
                  placeholder={profId ? 'Buscar disciplina' : 'Selecione um professor primeiro'}
                  editable={!!profId}
                  placeholderTextColor="#9CA3AF"
                  value={discQuery}
                  onChangeText={setDiscQuery}
                  className="text-white mb-2"
                />
                <View className="max-h-56">
                  <ScrollView>
                    {(!profId) ? (
                      <Text className="text-white/50">Escolha um professor para listar as disciplinas vinculadas.</Text>
                    ) : (
                      filteredDiscs.map(d => {
                        const curso = cursos.find(c => c.id_curso === (d.id_curso as any));
                        return (
                          <TouchableOpacity key={d.id_disciplina} onPress={() => setDiscId(d.id_disciplina)} className={`px-3 py-2 rounded-lg mb-2 ${discId===d.id_disciplina? 'bg-[#1C4AED]':'bg-[#111827]'}`}>
                            <Text className={discId===d.id_disciplina? 'text-white':'text-white/80'}>
                              {d.nome}{curso ? ` · ${curso.nome}` : ''}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
                {discId && profId && !isLinked(profId, discId) ? (
                  <Text className="text-red-400 mt-1">Professor não vinculado à disciplina selecionada.</Text>
                ) : null}
              </View>

              {/* Ação */}
              <TouchableOpacity disabled={saving} onPress={criarFixo} className="mt-4 self-start bg-[#1C4AED] rounded-xl px-5 py-3">
                <Text className="text-white font-semibold">{saving? 'Salvando...':'Criar horário fixo'}</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de fixos existentes (filtrada) */}
            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-white font-semibold text-lg">Fixos existentes</Text>
                <Text className="text-white/60 text-xs">{fixosFiltrados.length} itens</Text>
              </View>

              {fixosFiltrados.length === 0 ? (
                <Text className="text-white/60">Nenhum horário fixo para os filtros selecionados.</Text>
              ) : (
                fixosFiltrados.map(f => (
                  <View key={f.id_horario_fixo} className="bg-[#0B1220] border border-[#111827] rounded-2xl p-4 mb-3">
                    <View className="flex-row items-center">
                      <View className="w-9 h-9 rounded-full bg-[#1F2937] items-center justify-center mr-3">
                        <Ionicons name="time-outline" size={18} color="#93C5FD" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold capitalize">{f.dia_semana} • {tlabel(f.horario)}</Text>
                        <Text className="text-white/70 text-xs">Lab {f.nome_laboratorio} • {f.nome_usuario}</Text>
                      </View>
                      <TouchableOpacity disabled={deleting===f.id_horario_fixo} onPress={() => removerFixo(f.id_horario_fixo)} className="px-3 py-2 rounded-lg bg-red-600/80">
                        <Text className="text-white text-xs">{deleting===f.id_horario_fixo? 'Removendo...':'Remover'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
