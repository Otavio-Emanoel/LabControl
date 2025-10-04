import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

interface Curso { id_curso: number; nome: string }
interface Disciplina { id_disciplina: number; nome: string; id_curso: number }

export default function AdicionarDisciplinaScreen() {
  const router = useRouter();

  // Form
  const [nome, setNome] = useState('');
  const [idCurso, setIdCurso] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Collections
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [errorDisciplinas, setErrorDisciplinas] = useState<string | null>(null);

  // Filters
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCursoId, setFiltroCursoId] = useState<number | null>(null);

  const loadCursos = useCallback(async () => {
    try {
      setErrorCursos(null);
      setLoadingCursos(true);
      const res = await api.get<Curso[]>('/auth/cursos');
      const list = (res.data as any) || [];
      setCursos(list);
      if (list.length && idCurso == null) setIdCurso(list[0].id_curso);
    } catch {
      setErrorCursos('Erro ao carregar cursos.');
    } finally {
      setLoadingCursos(false);
    }
  }, [idCurso]);

  const loadDisciplinas = useCallback(async () => {
    try {
      setErrorDisciplinas(null);
      setLoadingDisciplinas(true);
      const res = await api.get<Disciplina[]>('/auth/disciplinas');
      setDisciplinas((res.data as any) || []);
    } catch {
      setErrorDisciplinas('Erro ao carregar disciplinas.');
    } finally {
      setLoadingDisciplinas(false);
    }
  }, []);

  useEffect(() => {
    loadCursos();
    loadDisciplinas();
  }, [loadCursos, loadDisciplinas]);

  const validate = () => {
    if (!nome.trim()) return 'Informe o nome da disciplina.';
    if (nome.trim().length < 3) return 'O nome da disciplina deve ter pelo menos 3 caracteres.';
    if (!idCurso) return 'Selecione um curso.';
    return null;
  };

  const onSubmit = async () => {
    const v = validate();
    if (v) { setErrorMsg(v); return; }
    try {
      setErrorMsg(null);
      setSubmitting(true);
      await api.post('/auth/disciplina', { nome: nome.trim(), id_curso: idCurso });
      Alert.alert('Sucesso', 'Disciplina adicionada com sucesso!');
      setNome('');
      loadDisciplinas();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = status === 403 ? 'Coordenador ou Auxiliar Docente necessário para adicionar disciplina.' : e?.response?.data?.error || 'Falha ao adicionar disciplina.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const disciplinasFiltradas = useMemo(() => {
    const q = filtroNome.trim().toLowerCase();
    return disciplinas.filter(d => {
      const matchCurso = filtroCursoId ? d.id_curso === filtroCursoId : true;
      if (!matchCurso) return false;
      if (!q) return true;
      const nomeDisc = (d.nome || '').toLowerCase();
      const nomeCurso = (cursos.find(c => c.id_curso === d.id_curso)?.nome || '').toLowerCase();
      return nomeDisc.includes(q) || nomeCurso.includes(q);
    });
  }, [disciplinas, filtroNome, filtroCursoId, cursos]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <LinearGradient colors={['#05080eff', '#0a0f1c']} style={{ position: 'absolute', inset: 0 as any }} />
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginTop: 20 }}>
        <View style={{ width: 100 }}>
          <BackButton variant="glass" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Nova Disciplina</Text>
          <Text style={{ color: '#64748B', marginTop: 4, fontSize: 13 }}>Crie uma disciplina e associe-a a um curso existente.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          {/* Formulário */}
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a', marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="book-outline" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Cadastro de Disciplina</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>Informe nome (mín. 3) e selecione o curso.</Text>
              </View>
              <TouchableOpacity onPress={() => { loadCursos(); loadDisciplinas(); }} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <View style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626', borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 13 }}>{errorMsg}</Text>
              </View>
            ) : null}

            <Field label="Nome da disciplina" icon="document-text-outline">
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Algoritmos e Programação"
                placeholderTextColor="#64748B"
                style={inputStyle}
              />
            </Field>

            {/* Seleção de curso */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Curso</Text>
              {loadingCursos ? (
                <ActivityIndicator color="#3B82F6" />
              ) : errorCursos ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#F87171' }}>{errorCursos}</Text>
                  <TouchableOpacity onPress={loadCursos} style={{ alignSelf: 'flex-start', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : cursos.length === 0 ? (
                <Text style={{ color: '#64748B' }}>Nenhum curso encontrado. Cadastre primeiro.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {cursos.map(c => {
                    const selected = idCurso === c.id_curso;
                    return (
                      <TouchableOpacity
                        key={c.id_curso}
                        onPress={() => setIdCurso(c.id_curso)}
                        style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1e293b' }}
                      >
                        <Text style={{ color: selected ? 'white' : '#94A3B8', fontWeight: '600' }}>{c.nome}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={submitting}
                style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#94A3B8', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onSubmit}
                disabled={submitting}
                style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5, opacity: submitting ? 0.85 : 1 }}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <><Ionicons name="save-outline" size={18} color="#fff" /><Text style={{ color: 'white', fontWeight: '800' }}>Salvar</Text></>}
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Listagem */}
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#164e6355', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="list-outline" size={20} color="#6EE7B7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Disciplinas cadastradas</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{disciplinas.length} registro(s)</Text>
              </View>
              <TouchableOpacity onPress={loadDisciplinas} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filtros */}
            {disciplinas.length > 0 && (
              <Field
                label="Filtrar"
                icon="search-outline"
                helper={filtroNome || filtroCursoId != null ? `${disciplinasFiltradas.length} resultado(s)` : undefined}
              >
                <TextInput
                  value={filtroNome}
                  onChangeText={setFiltroNome}
                  placeholder="Buscar por nome ou curso"
                  placeholderTextColor="#475569"
                  style={inputStyle}
                />
              </Field>
            )}

            {cursos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }} style={{ marginBottom: 8 }}>
                <TouchableOpacity
                  onPress={() => setFiltroCursoId(null)}
                  style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: filtroCursoId == null ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: filtroCursoId == null ? '#3B82F6' : '#1e293b' }}
                >
                  <Text style={{ color: filtroCursoId == null ? 'white' : '#94A3B8', fontWeight: '600' }}>Todos</Text>
                </TouchableOpacity>
                {cursos.map(c => {
                  const selected = filtroCursoId === c.id_curso;
                  return (
                    <TouchableOpacity
                      key={`f-${c.id_curso}`}
                      onPress={() => setFiltroCursoId(c.id_curso)}
                      style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1e293b' }}
                    >
                      <Text style={{ color: selected ? 'white' : '#94A3B8', fontWeight: '600' }}>{c.nome}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {(filtroNome || filtroCursoId != null) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <TouchableOpacity onPress={() => { setFiltroNome(''); setFiltroCursoId(null); }}>
                  <Text style={{ color: '#93C5FD' }}>Limpar filtros</Text>
                </TouchableOpacity>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{disciplinasFiltradas.length} / {disciplinas.length}</Text>
              </View>
            )}

            {loadingDisciplinas ? (
              <View style={{ paddingVertical: 12 }}><ActivityIndicator color="#3B82F6" /></View>
            ) : errorDisciplinas ? (
              <View style={{ gap: 8 }}>
                <Text style={{ color: '#F87171' }}>{errorDisciplinas}</Text>
                <TouchableOpacity onPress={loadDisciplinas} style={{ alignSelf: 'flex-start', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : disciplinasFiltradas.length === 0 ? (
              <Text style={{ color: '#64748B', marginTop: 6 }}>Nenhuma disciplina encontrada.</Text>
            ) : (
              <View style={{ marginTop: 4 }}>
                {disciplinasFiltradas.map((d, idx) => {
                  const cursoNome = cursos.find(c => c.id_curso === d.id_curso)?.nome || `#${d.id_curso}`;
                  return (
                    <View key={d.id_disciplina} style={{
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: idx % 2 === 0 ? '#122033' : '#16263a',
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#1e2f44'
                    }}>
                      <Text style={{ color: 'white', fontWeight: '600' }}>{d.nome}</Text>
                      <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Curso: {cursoNome}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, children, helper }: { label: string; icon: any; children: React.ReactNode; helper?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 12, minHeight: 54 }}>
        <Ionicons name={icon} size={18} color="#475569" style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>{children}</View>
      </View>
      {helper ? <Text style={{ color: '#475569', fontSize: 11, marginTop: 4 }}>{helper}</Text> : null}
    </View>
  );
}

const inputStyle = {
  color: 'white',
  fontSize: 14,
  paddingVertical: 0,
};
