import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';

interface Professor { id_usuario: number; nome: string; email: string }
interface Disciplina { id_disciplina: number; nome: string; id_curso: number }
interface Curso { id_curso: number; nome: string }
interface Vinculo { id_usuario: number; nome_professor: string; id_disciplina: number; nome_disciplina: string }

export default function AtribuirAulaScreen() {
  const router = useRouter();

  // Dados base
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Seleções
  const [profSel, setProfSel] = useState<number | null>(null);
  const [discSel, setDiscSel] = useState<number | null>(null);

  // Filtros
  const [qProf, setQProf] = useState('');
  const [qDisc, setQDisc] = useState('');
  const [cursoFiltroId, setCursoFiltroId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [profRes, discRes, cursoRes, vincRes] = await Promise.all([
        api.get<Professor[]>('/auth/professores'),
        api.get<Disciplina[]>('/auth/disciplinas'),
        api.get<Curso[]>('/auth/cursos'),
        api.get<Vinculo[]>('/auth/professores-disciplinas'),
      ]);
      setProfessores((profRes.data as any) || []);
      setDisciplinas((discRes.data as any) || []);
      setCursos((cursoRes.data as any) || []);
      setVinculos((vincRes.data as any) || []);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const profsFiltrados = useMemo(() => {
    const q = qProf.trim().toLowerCase();
    return professores.filter((p) => !(q && !(`${p.nome} ${p.email}`.toLowerCase().includes(q))));
  }, [professores, qProf]);

  const discsFiltradas = useMemo(() => {
    const q = qDisc.trim().toLowerCase();
    return disciplinas.filter((d) => {
      const okCurso = cursoFiltroId ? d.id_curso === cursoFiltroId : true;
      if (!okCurso) return false;
      const nomeDisc = (d.nome || '').toLowerCase();
      const nomeCurso = (cursos.find((c) => c.id_curso === d.id_curso)?.nome || '').toLowerCase();
      return !(q && !(nomeDisc.includes(q) || nomeCurso.includes(q)));
    });
  }, [disciplinas, qDisc, cursoFiltroId, cursos]);

  const onVincular = async () => {
    if (!profSel || !discSel) {
      Alert.alert('Atenção', 'Selecione um professor e uma disciplina.');
      return;
    }
    try {
      await api.post('/auth/professor-disciplina', { id_usuario: profSel, id_disciplina: discSel });
      Alert.alert('Sucesso', 'Vínculo criado com sucesso!');
      setProfSel(null);
      setDiscSel(null);
      loadAll();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = status === 409 ? 'Professor já vinculado à disciplina.' : e?.response?.data?.error || 'Falha ao vincular.';
      Alert.alert('Erro', msg);
    }
  };

  const onRemoverVinculo = async (id_usuario: number, id_disciplina: number) => {
    try {
      await api.post('/auth/professor-disciplina/remove', { id_usuario, id_disciplina });
      Alert.alert('Sucesso', 'Vínculo removido com sucesso!');
      loadAll();
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Falha ao remover vínculo.';
      Alert.alert('Erro', msg);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>Atribuir aula a professor</Text>
        <TouchableOpacity onPress={loadAll}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {errorMsg ? <Text style={{ color: '#F87171', textAlign: 'center' }}>{errorMsg}</Text> : null}

      <ScrollView contentContainerStyle={{ gap: 16 }}>
        {/* Seleção de Professor */}
        <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="person-outline" size={20} color="#93C5FD" />
            <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Professor</Text>
          </View>
          <TextInput
            value={qProf}
            onChangeText={setQProf}
            placeholder="Buscar professor por nome ou e-mail"
            placeholderTextColor="#6B7280"
            style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
          />
          {loading ? (
            <ActivityIndicator color="#3B82F6" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {profsFiltrados.map((p) => {
                const selected = profSel === p.id_usuario;
                return (
                  <TouchableOpacity
                    key={p.id_usuario}
                    onPress={() => setProfSel(p.id_usuario)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#111827', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1F2937' }}
                  >
                    <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{p.nome}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Seleção de Disciplina */}
        <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="book-outline" size={20} color="#93C5FD" />
            <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Disciplina</Text>
          </View>
          <TextInput
            value={qDisc}
            onChangeText={setQDisc}
            placeholder="Buscar disciplina por nome ou curso"
            placeholderTextColor="#6B7280"
            style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
          />
          {/* Filtro por curso */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setCursoFiltroId(null)}
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: cursoFiltroId == null ? '#2563EB' : '#111827', borderWidth: 1, borderColor: cursoFiltroId == null ? '#3B82F6' : '#1F2937' }}
            >
              <Text style={{ color: cursoFiltroId == null ? 'white' : '#9CA3AF', fontWeight: '600' }}>Todos</Text>
            </TouchableOpacity>
            {cursos.map((c) => {
              const selected = cursoFiltroId === c.id_curso;
              return (
                <TouchableOpacity key={c.id_curso} onPress={() => setCursoFiltroId(c.id_curso)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#111827', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1F2937' }}>
                  <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{c.nome}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {loading ? (
            <ActivityIndicator color="#3B82F6" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {discsFiltradas.map((d) => {
                const selected = discSel === d.id_disciplina;
                return (
                  <TouchableOpacity
                    key={d.id_disciplina}
                    onPress={() => setDiscSel(d.id_disciplina)}
                    style={{ paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#111827', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1F2937' }}
                  >
                    <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{d.nome}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Ações */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={onVincular}
            style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Vincular</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setProfSel(null); setDiscSel(null); }}
            style={{ flex: 1, backgroundColor: '#374151', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>Limpar</Text>
          </TouchableOpacity>
        </View>

        {/* Listagem de Vínculos e remoção */}
        <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="people" size={20} color="#93C5FD" />
              <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Vínculos existentes</Text>
            </View>
            <TouchableOpacity onPress={loadAll}>
              <Ionicons name="refresh" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color="#3B82F6" />
          ) : vinculos.length === 0 ? (
            <Text style={{ color: '#9CA3AF' }}>Nenhum vínculo encontrado.</Text>
          ) : (
            <View style={{ borderWidth: 1, borderColor: '#111827', borderRadius: 12, overflow: 'hidden' }}>
              {vinculos.map((v, idx) => (
                <View key={`${v.id_usuario}-${v.id_disciplina}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, backgroundColor: idx % 2 ? '#0F172A' : '#111827' }}>
                  <View>
                    <Text style={{ color: 'white', fontWeight: '600' }}>{v.nome_professor}</Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12 }}>Disciplina: {v.nome_disciplina}</Text>
                  </View>
                  <TouchableOpacity onPress={() => onRemoverVinculo(v.id_usuario, v.id_disciplina)} style={{ backgroundColor: '#B91C1C', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                    <Text style={{ color: 'white', fontWeight: '700' }}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
