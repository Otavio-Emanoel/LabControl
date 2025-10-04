import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';

interface Curso { id_curso: number; nome: string }
interface Disciplina { id_disciplina: number; nome: string; id_curso: number }

export default function RemoverDisciplinaScreen() {
  const router = useRouter();
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [filtro, setFiltro] = useState('');
  const [cursoFiltroId, setCursoFiltroId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErro(null);
      setLoading(true);
      const [discRes, cursoRes] = await Promise.all([
        api.get<Disciplina[]>('/auth/disciplinas'),
        api.get<Curso[]>('/auth/cursos')
      ]);
      setDisciplinas((discRes.data as any) || []);
      setCursos((cursoRes.data as any) || []);
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Falha ao carregar disciplinas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const disciplinasFiltradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    return disciplinas.filter(d => {
      const matchCurso = cursoFiltroId ? d.id_curso === cursoFiltroId : true;
      if (!matchCurso) return false;
      if (!q) return true;
      const nomeDisc = (d.nome || '').toLowerCase();
      const nomeCurso = (cursos.find(c => c.id_curso === d.id_curso)?.nome || '').toLowerCase();
      return nomeDisc.includes(q) || nomeCurso.includes(q);
    });
  }, [disciplinas, filtro, cursoFiltroId, cursos]);

  const confirmarRemocao = (disc: Disciplina) => {
    Alert.alert('Remover disciplina', `Deseja remover a disciplina "${disc.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remover(disc.id_disciplina) }
    ]);
  };

  const remover = async (id: number) => {
    try {
      setRemovendo(id);
      await api.delete(`/auth/disciplina/${id}`);
      setDisciplinas(prev => prev.filter(d => d.id_disciplina !== id));
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = status === 409 ? 'Não é possível remover: há vínculos ou reservas associadas.' : e?.response?.data?.error || 'Falha ao remover disciplina.';
      Alert.alert('Erro', msg);
    } finally {
      setRemovendo(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <LinearGradient colors={['#05080eff', '#0a0f1c']} style={{ position: 'absolute', inset: 0 as any }} />
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}><ConnectionBadge /></View>

      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginTop: 20 }}>
        <View style={{ width: 100 }}>
          <BackButton variant="glass" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Remover Disciplina</Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Exclua disciplinas sem vínculos ativos.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 70 }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="book-outline" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Disciplinas</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{disciplinasFiltradas.length} de {disciplinas.length} exibida(s)</Text>
              </View>
              <TouchableOpacity onPress={load} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Field label="Filtrar" icon="search-outline" helper={filtro ? `${disciplinasFiltradas.length} resultado(s)` : undefined}>
              <TextInput
                value={filtro}
                onChangeText={setFiltro}
                placeholder="Nome ou curso"
                placeholderTextColor="#475569"
                style={inputStyle}
              />
            </Field>

            {/* Chips de curso */}
            {cursos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginBottom: 10 }}>
                <TouchableOpacity
                  onPress={() => setCursoFiltroId(null)}
                  style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: cursoFiltroId == null ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: cursoFiltroId == null ? '#3B82F6' : '#1e293b' }}
                >
                  <Text style={{ color: cursoFiltroId == null ? 'white' : '#94A3B8', fontWeight: '600' }}>Todos</Text>
                </TouchableOpacity>
                {cursos.map(c => {
                  const selected = cursoFiltroId === c.id_curso;
                  return (
                    <TouchableOpacity
                      key={c.id_curso}
                      onPress={() => setCursoFiltroId(selected ? null : c.id_curso)}
                      style={{ paddingVertical: 6, paddingHorizontal: 14, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1e293b' }}
                    >
                      <Text style={{ color: selected ? 'white' : '#94A3B8', fontWeight: '600' }}>{c.nome}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {erro ? (
              <View style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626', borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 13 }}>{erro}</Text>
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : disciplinasFiltradas.length === 0 ? (
              <Text style={{ color: '#64748B' }}>Nenhuma disciplina encontrada.</Text>
            ) : (
              <View style={{ marginTop: 4 }}>
                {disciplinasFiltradas.map((d, idx) => {
                  const isRemoving = removendo === d.id_disciplina;
                  const cursoNome = cursos.find(c => c.id_curso === d.id_curso)?.nome || `#${d.id_curso}`;
                  return (
                    <View key={d.id_disciplina} style={{ padding: 14, borderRadius: 14, backgroundColor: idx % 2 === 0 ? '#122033' : '#16263a', marginBottom: 10, borderWidth: 1, borderColor: '#1e2f44', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>{d.nome}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Curso: {cursoNome}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmarRemocao(d)}
                        disabled={isRemoving}
                        style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#dc2626', flexDirection: 'row', alignItems: 'center', gap: 6, opacity: isRemoving ? 0.6 : 1 }}
                      >
                        {isRemoving ? <ActivityIndicator color="#fff" /> : <Ionicons name="trash-outline" size={16} color="#fff" />}
                        {!isRemoving && <Text style={{ color: 'white', fontWeight: '700' }}>Remover</Text>}
                      </TouchableOpacity>
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

const inputStyle = { color: 'white', fontSize: 14, paddingVertical: 0 };
