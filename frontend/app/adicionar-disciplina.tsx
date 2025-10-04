import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';

interface Curso { id_curso: number; nome: string }
interface Disciplina { id_disciplina: number; nome: string; id_curso: number }

export default function AdicionarDisciplinaScreen() {
  const router = useRouter();

  // Form
  const [nome, setNome] = useState('');
  const [idCurso, setIdCurso] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cursos (para seleção)
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);

  // Disciplinas (listagem)
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);
  const [errorDisciplinas, setErrorDisciplinas] = useState<string | null>(null);

  // Filtros (listagem)
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCursoId, setFiltroCursoId] = useState<number | null>(null);

  const loadCursos = useCallback(async () => {
    try {
      setLoadingCursos(true);
      setErrorCursos(null);
      const res = await api.get<Curso[]>('/auth/cursos');
      const data: Curso[] = Array.isArray(res.data) ? (res.data as any) : [];
      setCursos(data);
      if (data.length && idCurso == null) setIdCurso(data[0].id_curso);
    } catch {
      setErrorCursos('Erro ao carregar cursos.');
    } finally {
      setLoadingCursos(false);
    }
  }, [idCurso]);

  const loadDisciplinas = useCallback(async () => {
    try {
      setLoadingDisciplinas(true);
      setErrorDisciplinas(null);
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
    if (v) {
      setErrorMsg(v);
      return;
    }
    try {
      setErrorMsg(null);
      setSubmitting(true);
      await api.post('/auth/disciplina', { nome: nome.trim(), id_curso: idCurso });
      Alert.alert('Sucesso', 'Disciplina adicionada com sucesso!');
      setNome('');
      loadDisciplinas();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 403
          ? 'Coordenador ou Auxiliar Docente necessário para adicionar disciplina.'
          : e?.response?.data?.error || 'Falha ao adicionar disciplina.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const disciplinasFiltradas = useMemo(() => {
    const q = filtroNome.trim().toLowerCase();
    return disciplinas.filter((d) => {
      const okCurso = filtroCursoId ? d.id_curso === filtroCursoId : true;
      if (!okCurso) return false;
      if (!q) return true;
      const nomeDisc = (d.nome || '').toLowerCase();
      const nomeCurso = (cursos.find((c) => c.id_curso === d.id_curso)?.nome || '').toLowerCase();
      return nomeDisc.includes(q) || nomeCurso.includes(q);
    });
  }, [disciplinas, filtroNome, filtroCursoId, cursos]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>Adicionar disciplina</Text>
          <TouchableOpacity onPress={() => { loadCursos(); loadDisciplinas(); }} style={{ padding: 8 }}>
            <Ionicons name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {/* Card formulário */}
          <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="book-outline" size={20} color="#93C5FD" />
              <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Cadastro de Disciplina</Text>
            </View>

            {errorMsg ? <Text style={{ color: '#F87171' }}>{errorMsg}</Text> : null}

            {/* Nome */}
            <View style={{ gap: 6 }}>
              <Text style={{ color: '#9CA3AF' }}>Nome da disciplina</Text>
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Algoritmos e Programação"
                placeholderTextColor="#6B7280"
                style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
              />
            </View>

            {/* Curso (seleção) */}
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#9CA3AF' }}>Curso</Text>
              {loadingCursos ? (
                <ActivityIndicator color="#3B82F6" />
              ) : errorCursos ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ color: '#F87171' }}>{errorCursos}</Text>
                  <TouchableOpacity onPress={loadCursos} style={{ alignSelf: 'flex-start', backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: 'white' }}>Tentar novamente</Text>
                  </TouchableOpacity>
                </View>
              ) : cursos.length === 0 ? (
                <Text style={{ color: '#9CA3AF' }}>Nenhum curso encontrado. Cadastre um curso primeiro.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {cursos.map((c) => {
                    const selected = idCurso === c.id_curso;
                    return (
                      <TouchableOpacity
                        key={c.id_curso}
                        onPress={() => setIdCurso(c.id_curso)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 999,
                          backgroundColor: selected ? '#2563EB' : '#111827',
                          borderWidth: 1,
                          borderColor: selected ? '#3B82F6' : '#1F2937',
                        }}
                      >
                        <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{c.nome}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {/* Ações */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={onSubmit}
                disabled={submitting}
                style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={submitting}
                style={{ flex: 1, backgroundColor: '#374151', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card listagem */}
          <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 12, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="list-outline" size={20} color="#93C5FD" />
                <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Disciplinas cadastradas</Text>
              </View>
              <TouchableOpacity onPress={loadDisciplinas}>
                <Ionicons name="refresh" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Filtros */}
            <View style={{ gap: 8 }}>
              <TextInput
                value={filtroNome}
                onChangeText={setFiltroNome}
                placeholder="Filtrar por nome da disciplina ou curso"
                placeholderTextColor="#6B7280"
                style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
              />
              {cursos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setFiltroCursoId(null)}
                    style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: filtroCursoId == null ? '#2563EB' : '#111827', borderWidth: 1, borderColor: filtroCursoId == null ? '#3B82F6' : '#1F2937' }}
                  >
                    <Text style={{ color: filtroCursoId == null ? 'white' : '#9CA3AF', fontWeight: '600' }}>Todos</Text>
                  </TouchableOpacity>
                  {cursos.map((c) => {
                    const selected = filtroCursoId === c.id_curso;
                    return (
                      <TouchableOpacity
                        key={`f-${c.id_curso}`}
                        onPress={() => setFiltroCursoId(c.id_curso)}
                        style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#111827', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1F2937' }}
                      >
                        <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{c.nome}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
              {(filtroNome || filtroCursoId != null) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#9CA3AF' }}>{disciplinasFiltradas.length} resultado(s)</Text>
                  <TouchableOpacity onPress={() => { setFiltroNome(''); setFiltroCursoId(null); }}>
                    <Text style={{ color: '#93C5FD' }}>Limpar filtros</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {loadingDisciplinas ? (
              <View style={{ paddingVertical: 8 }}>
                <ActivityIndicator color="#3B82F6" />
              </View>
            ) : errorDisciplinas ? (
              <View style={{ gap: 8 }}>
                <Text style={{ color: '#F87171' }}>{errorDisciplinas}</Text>
                <TouchableOpacity onPress={loadDisciplinas} style={{ alignSelf: 'flex-start', backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                  <Text style={{ color: 'white' }}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : disciplinasFiltradas.length === 0 ? (
              <Text style={{ color: '#9CA3AF' }}>Nenhuma disciplina encontrada.</Text>
            ) : (
              <View style={{ borderWidth: 1, borderColor: '#111827', borderRadius: 12, overflow: 'hidden' }}>
                {disciplinasFiltradas.map((d, idx) => (
                  <View key={d.id_disciplina} style={{ paddingHorizontal: 12, paddingVertical: 12, backgroundColor: idx % 2 ? '#0F172A' : '#111827' }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>{d.nome}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Curso: {(cursos.find((c) => c.id_curso === d.id_curso)?.nome) || `#${d.id_curso}`}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
