import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, SafeAreaView, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

// Tipos
interface Lab { id_Laboratorio: number; numero: string; descricao?: string | null }
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

  // Seleções obrigatórias
  const [weekday, setWeekday] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [labId, setLabId] = useState<number | null>(null);
  const [profId, setProfId] = useState<number | null>(null);
  const [discId, setDiscId] = useState<number | null>(null); // agora obrigatório

  // Bases
  const [labs, setLabs] = useState<Lab[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [profDisc, setProfDisc] = useState<ProfDisc[]>([]);
  const [fixos, setFixos] = useState<Fixo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);

  // Loading
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [refreshingFixos, setRefreshingFixos] = useState(false);

  // Filtros e busca
  const [profQuery, setProfQuery] = useState('');
  const [discQuery, setDiscQuery] = useState('');
  const [fixoFiltroDia, setFixoFiltroDia] = useState<string>('');
  const [fixoFiltroLab, setFixoFiltroLab] = useState<number | null>(null);

  // Controle de exibição (performance para listas grandes)
  const [profShowAll, setProfShowAll] = useState(false);
  const [discShowAll, setDiscShowAll] = useState(false);

  const autorizado = cargo === 'Auxiliar_Docente' || cargo === 'Coordenador';

  const loadAll = useCallback(async () => {
    try {
      if (loadingPage === false) setRefreshingFixos(true);
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
      setRefreshingFixos(false);
    }
  }, [loadingPage]);

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
      loadAll();
    })();
  }, [ready, loadAll]);

  // Ao trocar professor, limpa disciplina
  useEffect(() => { setDiscId(null); setDiscQuery(''); }, [profId]);

  const filteredProfs = useMemo(() => {
    const q = profQuery.trim().toLowerCase();
    if (!q) return professores;
    return professores.filter(p => (p.nome || '').toLowerCase().includes(q));
  }, [professores, profQuery]);

  const filteredDiscs = useMemo(() => {
    const q = discQuery.trim().toLowerCase();
    if (!profId) return [] as Disciplina[];
    const idsVinculados = new Set(profDisc.filter(pd => pd.id_usuario === profId).map(pd => pd.id_disciplina));
    return disciplinas
      .filter(d => idsVinculados.has(d.id_disciplina))
      .filter(d => (d.nome || '').toLowerCase().includes(q))
      .sort((a,b) => a.nome.localeCompare(b.nome));
  }, [disciplinas, discQuery, profDisc, profId]);

  const isLinked = (uid?: number|null, did?: number|null) => {
    if (!uid || !did) return false; // agora ambos obrigatórios
    return profDisc.some(pd => pd.id_usuario === uid && pd.id_disciplina === did);
  };

  const refreshFixos = async () => {
    try {
      setRefreshingFixos(true);
      const r = await api.get<Fixo[]>('/horarios-fixos/');
      setFixos(r.data as any);
    } catch (e) {
      console.log('Falha ao atualizar fixos', e);
    } finally {
      setRefreshingFixos(false);
    }
  };

  const criarFixo = async () => {
    if (!autorizado) return Alert.alert('Acesso negado', 'Apenas Coordenador ou Auxiliar Docente.');
    if (!weekday || !time || !labId || !profId || !discId) return Alert.alert('Campos obrigatórios', 'Todos os campos são obrigatórios (incluindo disciplina).');
    if (!TIMES.includes(time)) return Alert.alert('Horário inválido', 'Selecione um horário permitido.');
    if (!isLinked(profId, discId)) return Alert.alert('Vínculo inválido', 'Professor não vinculado à disciplina escolhida.');
    try {
      setSaving(true);
      // OBS: endpoint atual não recebe disciplina; armazenada apenas para validação UI.
      await api.post('/horarios-fixos/', { dia_semana: weekday, horario: time, fk_lab: labId, fk_usuario: profId });
      Alert.alert('Sucesso', 'Horário fixo criado.');
      await refreshFixos();
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
    return fixos.filter(f => (!fixoFiltroDia || f.dia_semana === fixoFiltroDia) && (!fixoFiltroLab || f.id_Laboratorio === fixoFiltroLab));
  }, [fixos, fixoFiltroDia, fixoFiltroLab]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: 'black' }} />;

  if (!autorizado) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', fontWeight: '600' }}>Acesso restrito a Coordenador ou Auxiliar Docente.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <LinearGradient colors={['#05080eff', '#0a0f1c']} style={{ position: 'absolute', inset: 0 as any }} />
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}><ConnectionBadge /></View>

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginTop: 20 }}>
        <View style={{ width: 100 }}>
          <BackButton variant="glass" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Horários Fixos</Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Defina blocos fixos para professores vinculados às disciplinas.</Text>
        </View>
      </View>

      {loadingPage ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#3B82F6" /></View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
            {/* Configuração */}
            <LinearGradient colors={['#1e293b', '#101827']} start={{ x:0, y:0}} end={{x:1,y:1}} style={{ borderRadius: 20, padding: 18, borderWidth:1, borderColor:'#22324a', marginBottom:16 }}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:14 }}>
                <View style={{ width:44, height:44, borderRadius:12, backgroundColor:'#1E3A8A55', alignItems:'center', justifyContent:'center', marginRight:12 }}>
                  <Ionicons name="construct-outline" size={22} color="#93C5FD" />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:'#E2E8F0', fontSize:16, fontWeight:'700' }}>Configuração</Text>
                  <Text style={{ color:'#64748B', fontSize:12 }}>Escolha dia, horário e laboratório.</Text>
                </View>
                <TouchableOpacity onPress={loadAll} style={{ padding:6 }}><Ionicons name="refresh" size={18} color="#64748B" /></TouchableOpacity>
              </View>

              {/* Dia */}
              <Field label="Dia da semana" icon="calendar-outline" helper={weekday ? WEEKDAYS.find(d=>d.value===weekday)?.label : 'Selecione'}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
                  {WEEKDAYS.map(d => {
                    const sel = weekday === d.value;
                    return (
                      <TouchableOpacity key={d.value} onPress={() => setWeekday(d.value)} style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                        <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{d.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Field>

              {/* Horário */}
              <Field label="Horário" icon="time-outline" helper={time? tlabel(time): 'Escolha'}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
                  {TIMES.map(h => {
                    const sel = time === h;
                    return (
                      <TouchableOpacity key={h} onPress={() => setTime(h)} style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                        <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{tlabel(h)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Field>

              {/* Laboratório */}
              <Field label="Laboratório" icon="desktop-outline" helper={labId? `Selecionado: Lab ${labs.find(l=>l.id_Laboratorio===labId)?.numero}`:'Selecione um'}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
                  {labs.map(l => {
                    const sel = labId === l.id_Laboratorio;
                    return (
                      <TouchableOpacity key={l.id_Laboratorio} onPress={() => setLabId(l.id_Laboratorio)} style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                        <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{l.descricao}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Field>
            </LinearGradient>

            {/* Professor & Disciplina */}
            <LinearGradient colors={['#1e293b', '#101827']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ borderRadius:20, padding:18, borderWidth:1, borderColor:'#22324a', marginBottom:16 }}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:14 }}>
                <View style={{ width:44, height:44, borderRadius:12, backgroundColor:'#1E3A8A55', alignItems:'center', justifyContent:'center', marginRight:12 }}>
                  <Ionicons name="people-outline" size={22} color="#93C5FD" />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:'#E2E8F0', fontSize:16, fontWeight:'700' }}>Professor & Disciplina</Text>
                  <Text style={{ color:'#64748B', fontSize:12 }}>Ambos obrigatórios. Filtre e selecione.</Text>
                </View>
              </View>

              {/* Professores */}
              <Field label="Buscar Professor" icon="search-outline" helper={`${filteredProfs.length}/${professores.length}`}>
                <TextInput
                  value={profQuery}
                  onChangeText={setProfQuery}
                  placeholder="Nome do professor"
                  placeholderTextColor="#475569"
                  style={inputStyle}
                />
              </Field>
              <FlatList
                data={(profShowAll? filteredProfs : filteredProfs.slice(0, 30)).sort((a,b)=>a.nome.localeCompare(b.nome))}
                keyExtractor={p=>String(p.id_usuario)}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap:8, paddingVertical:4 }}
                renderItem={({item}) => {
                  const sel = profId === item.id_usuario;
                  return (
                    <TouchableOpacity onPress={()=> setProfId(prev => prev===item.id_usuario? null: item.id_usuario)} style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                      <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{item.nome}</Text>
                    </TouchableOpacity>
                  );
                }}
              />
              {filteredProfs.length > 30 && (
                <TouchableOpacity onPress={()=> setProfShowAll(s=>!s)} style={{ marginTop:8, alignSelf:'flex-start' }}>
                  <Text style={{ color:'#93C5FD', fontSize:12 }}>{profShowAll? 'Mostrar menos':'Mostrar todos ('+filteredProfs.length+')'}</Text>
                </TouchableOpacity>
              )}

              {/* Disciplinas */}
              <Field label="Buscar Disciplina" icon="book-outline" helper={profId? `${filteredDiscs.length} vinculada(s)`:'Escolha um professor primeiro'}>
                <TextInput
                  value={discQuery}
                  onChangeText={setDiscQuery}
                  placeholder={profId? 'Nome da disciplina':'Selecione professor'}
                  editable={!!profId}
                  placeholderTextColor="#475569"
                  style={[inputStyle, { opacity: profId? 1: 0.4 }]}
                />
              </Field>
              {profId ? (
                filteredDiscs.length === 0 ? (
                  <Text style={{ color:'#64748B', fontSize:13 }}>Nenhuma disciplina vinculada.</Text>
                ) : (
                  <FlatList
                    data={(discShowAll? filteredDiscs : filteredDiscs.slice(0, 30))}
                    keyExtractor={d=>String(d.id_disciplina)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap:8, paddingVertical:4 }}
                    renderItem={({item}) => {
                      const sel = discId === item.id_disciplina;
                      const curso = cursos.find(c=> c.id_curso === (item.id_curso as any));
                      return (
                        <TouchableOpacity onPress={()=> setDiscId(prev => prev===item.id_disciplina? null: item.id_disciplina)} style={{ paddingVertical:8, paddingHorizontal:16, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                          <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{item.nome}{curso? ` · ${curso.nome}`:''}</Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                )
              ) : null}
              {filteredDiscs.length > 30 && (
                <TouchableOpacity onPress={()=> setDiscShowAll(s=>!s)} style={{ marginTop:8, alignSelf:'flex-start' }}>
                  <Text style={{ color:'#93C5FD', fontSize:12 }}>{discShowAll? 'Mostrar menos':'Mostrar todas ('+filteredDiscs.length+')'}</Text>
                </TouchableOpacity>
              )}
              {profId && discId && !isLinked(profId, discId) ? (
                <Text style={{ color:'#FCA5A5', fontSize:12, marginTop:6 }}>Professor não vinculado à disciplina.</Text>
              ) : null}

              <View style={{ flexDirection:'row', gap:14, marginTop:16 }}>
                <TouchableOpacity
                  onPress={() => { setWeekday(''); setTime(''); setLabId(null); setProfId(null); setDiscId(null); setProfQuery(''); setDiscQuery(''); }}
                  disabled={saving}
                  style={{ flex:1, height:54, borderRadius:14, backgroundColor:'#1e293b', borderWidth:1, borderColor:'#334155', alignItems:'center', justifyContent:'center' }}>
                  <Text style={{ color:'#94A3B8', fontWeight:'700' }}>Limpar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={criarFixo}
                  disabled={saving || !weekday || !time || !labId || !profId || !discId || !isLinked(profId, discId)}
                  style={{ flex:1, height:54, borderRadius:14, backgroundColor: (weekday && time && labId && profId && discId && isLinked(profId, discId))? '#10B981':'#0f172a', borderWidth:1, borderColor:'#1e293b', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, opacity: saving? 0.85:1 }}>
                  {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save-outline" size={18} color={ (weekday && time && labId && profId && discId && isLinked(profId, discId))? '#fff':'#475569' } /><Text style={{ color:(weekday && time && labId && profId && discId && isLinked(profId, discId))? 'white':'#475569', fontWeight:'800' }}>Salvar</Text></>}
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Filtros de listagem de fixos */}
            <LinearGradient colors={['#1e293b', '#101827']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ borderRadius:20, padding:18, borderWidth:1, borderColor:'#22324a', marginBottom:16 }}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:14 }}>
                <View style={{ width:44, height:44, borderRadius:12, backgroundColor:'#164e6355', alignItems:'center', justifyContent:'center', marginRight:12 }}>
                  <Ionicons name="filter-outline" size={22} color="#6EE7B7" />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:'#E2E8F0', fontSize:16, fontWeight:'700' }}>Filtrar Fixos</Text>
                  <Text style={{ color:'#64748B', fontSize:12 }}>{fixosFiltrados.length} de {fixos.length} exibidos</Text>
                </View>
                <TouchableOpacity onPress={refreshFixos} style={{ padding:6 }}><Ionicons name="refresh" size={18} color="#64748B" /></TouchableOpacity>
              </View>
              <Field label="Dia" icon="calendar-clear-outline">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
                  <TouchableOpacity onPress={()=> setFixoFiltroDia('')} style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:999, backgroundColor: fixoFiltroDia===''? '#2563EB':'#0f172a', borderWidth:1, borderColor: fixoFiltroDia===''? '#3B82F6':'#1e293b' }}>
                    <Text style={{ color: fixoFiltroDia===''? 'white':'#94A3B8', fontWeight:'600' }}>Todos</Text>
                  </TouchableOpacity>
                  {WEEKDAYS.map(d=> {
                    const sel = fixoFiltroDia === d.value;
                    return (
                      <TouchableOpacity key={d.value} onPress={()=> setFixoFiltroDia(sel? '': d.value)} style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                        <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>{d.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Field>
              <Field label="Laboratório" icon="cube-outline">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap:8 }}>
                  <TouchableOpacity onPress={()=> setFixoFiltroLab(null)} style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:999, backgroundColor: fixoFiltroLab==null? '#2563EB':'#0f172a', borderWidth:1, borderColor: fixoFiltroLab==null? '#3B82F6':'#1e293b' }}>
                    <Text style={{ color: fixoFiltroLab==null? 'white':'#94A3B8', fontWeight:'600' }}>Todos</Text>
                  </TouchableOpacity>
                  {labs.map(l=> {
                    const sel = fixoFiltroLab === l.id_Laboratorio;
                    return (
                      <TouchableOpacity key={l.id_Laboratorio} onPress={()=> setFixoFiltroLab(sel? null: l.id_Laboratorio)} style={{ paddingVertical:6, paddingHorizontal:14, borderRadius:999, backgroundColor: sel? '#2563EB':'#0f172a', borderWidth:1, borderColor: sel? '#3B82F6':'#1e293b' }}>
                        <Text style={{ color: sel? 'white':'#94A3B8', fontWeight:'600' }}>Lab {l.numero}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Field>
            </LinearGradient>

            {/* Listagem de Fixos */}
            <LinearGradient colors={['#1e293b', '#101827']} start={{x:0,y:0}} end={{x:1,y:1}} style={{ borderRadius:20, padding:18, borderWidth:1, borderColor:'#22324a' }}>
              <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
                <View style={{ width:40, height:40, borderRadius:12, backgroundColor:'#1E3A8A55', alignItems:'center', justifyContent:'center', marginRight:10 }}>
                  <Ionicons name="time-outline" size={20} color="#93C5FD" />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ color:'#E2E8F0', fontSize:16, fontWeight:'700' }}>Fixos existentes</Text>
                  <Text style={{ color:'#64748B', fontSize:12 }}>{fixosFiltrados.length} registro(s)</Text>
                </View>
                {refreshingFixos ? <ActivityIndicator color="#3B82F6" /> : null}
              </View>
              {fixosFiltrados.length === 0 ? (
                <Text style={{ color:'#64748B' }}>Nenhum horário fixo encontrado.</Text>
              ) : (
                <View style={{ marginTop:4 }}>
                  {fixosFiltrados
                    .slice()
                    .sort((a,b)=> a.dia_semana.localeCompare(b.dia_semana) || a.horario.localeCompare(b.horario))
                    .map((f,idx) => {
                      const removing = deleting === f.id_horario_fixo;
                      return (
                        <View key={f.id_horario_fixo} style={{ padding:14, borderRadius:14, backgroundColor: idx % 2 === 0 ? '#122033':'#16263a', marginBottom:10, borderWidth:1, borderColor:'#1e2f44', flexDirection:'row', alignItems:'center' }}>
                          <View style={{ flex:1 }}>
                            <Text style={{ color:'white', fontWeight:'600', textTransform:'capitalize' }}>{f.dia_semana} • {tlabel(f.horario)}</Text>
                            <Text style={{ color:'#94A3B8', fontSize:12, marginTop:4 }}>Lab {f.nome_laboratorio} • {f.nome_usuario}</Text>
                          </View>
                          <TouchableOpacity disabled={removing} onPress={()=> removerFixo(f.id_horario_fixo)} style={{ paddingVertical:10, paddingHorizontal:14, borderRadius:12, backgroundColor:'#dc2626', flexDirection:'row', alignItems:'center', gap:6, opacity: removing? 0.6:1 }}>
                            {removing? <ActivityIndicator color="#fff" /> : <Ionicons name="trash-outline" size={16} color="#fff" />}
                            {!removing && <Text style={{ color:'white', fontWeight:'700', fontSize:13 }}>Remover</Text>}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                </View>
              )}
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function Field({ label, icon, children, helper }: { label: string; icon: any; children: React.ReactNode; helper?: string }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color:'#94A3B8', fontSize:13, fontWeight:'600', marginBottom:6 }}>{label}</Text>
      <View style={{ backgroundColor:'#0f172a', borderRadius:14, borderWidth:1, borderColor:'#1e293b', padding:12 }}>
        {children}
      </View>
      {helper ? <Text style={{ color:'#475569', fontSize:11, marginTop:4 }}>{helper}</Text> : null}
    </View>
  );
}

const inputStyle = {
  color: 'white',
  fontSize: 14,
  paddingVertical: 0,
};
