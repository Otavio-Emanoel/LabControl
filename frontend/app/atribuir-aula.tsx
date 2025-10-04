import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Estados
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null); // chave id_usuario-id_disciplina

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
    } catch {
      // Erro silencioso ao carregar dados iniciais
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const profsFiltrados = useMemo(() => {
    const q = qProf.trim().toLowerCase();
    return professores.filter(p => {
      if (!q) return true;
      return (`${p.nome} ${p.email}`).toLowerCase().includes(q);
    });
  }, [professores, qProf]);

  const discsFiltradas = useMemo(() => {
    const q = qDisc.trim().toLowerCase();
    return disciplinas.filter(d => {
      const cursoOk = cursoFiltroId ? d.id_curso === cursoFiltroId : true;
      if (!cursoOk) return false;
      if (!q) return true;
      const nomeDisc = (d.nome || '').toLowerCase();
      const nomeCurso = (cursos.find(c => c.id_curso === d.id_curso)?.nome || '').toLowerCase();
      return nomeDisc.includes(q) || nomeCurso.includes(q);
    });
  }, [disciplinas, qDisc, cursoFiltroId, cursos]);

  const onVincular = async () => {
    if (!profSel || !discSel) {
      Alert.alert('Atenção', 'Selecione um professor e uma disciplina.');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/auth/professor-disciplina', { id_usuario: profSel, id_disciplina: discSel });
      Alert.alert('Sucesso', 'Vínculo criado com sucesso!');
      setProfSel(null);
      setDiscSel(null);
      loadAll();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = status === 409 ? 'Professor já vinculado à disciplina.' : e?.response?.data?.error || 'Falha ao vincular.';
      Alert.alert('Erro', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onRemoverVinculo = async (id_usuario: number, id_disciplina: number) => {
    const key = `${id_usuario}-${id_disciplina}`;
    try {
      setRemovendo(key);
      await api.post('/auth/professor-disciplina/remove', { id_usuario, id_disciplina });
      loadAll();
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Falha ao remover vínculo.';
      Alert.alert('Erro', msg);
    } finally {
      setRemovendo(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <LinearGradient colors={['#05080eff', '#0a0f1c']} style={{ position: 'absolute', inset: 0 as any }} />
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>

      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginTop: 20 }}>
        <View style={{ width: 100 }}>
          <BackButton variant="glass" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Atribuir Aula</Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Vincule professores às disciplinas disponíveis.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 70 }} keyboardShouldPersistTaps="handled">
          {/* Card Professor */}
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="person-outline" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Professor</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{profsFiltrados.length} de {professores.length} filtrado(s)</Text>
              </View>
              <TouchableOpacity onPress={loadAll} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Field label="Buscar" icon="search-outline">
              <TextInput
                value={qProf}
                onChangeText={setQProf}
                placeholder="Nome ou e-mail"
                placeholderTextColor="#475569"
                style={inputStyle}
              />
            </Field>

            {loading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : profsFiltrados.length === 0 ? (
              <Text style={{ color: '#64748B' }}>Nenhum professor encontrado.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginTop: 4 }}>
                {profsFiltrados.map(p => {
                  const selected = profSel === p.id_usuario;
                  return (
                    <TouchableOpacity
                      key={p.id_usuario}
                      onPress={() => setProfSel(prev => prev === p.id_usuario ? null : p.id_usuario)}
                      style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1e293b' }}
                    >
                      <Text style={{ color: selected ? 'white' : '#94A3B8', fontWeight: '600' }}>{p.nome}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </LinearGradient>

          {/* Card Disciplina */}
            <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="book-outline" size={22} color="#93C5FD" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Disciplina</Text>
                  <Text style={{ color: '#64748B', fontSize: 12 }}>{discsFiltradas.length} de {disciplinas.length} filtrada(s)</Text>
                </View>
                <TouchableOpacity onPress={loadAll} style={{ padding: 6 }}>
                  <Ionicons name="refresh" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Field label="Buscar" icon="search-outline">
                <TextInput
                  value={qDisc}
                  onChangeText={setQDisc}
                  placeholder="Nome ou curso"
                  placeholderTextColor="#475569"
                  style={inputStyle}
                />
              </Field>

              {/* Filtro por curso */}
              {cursos.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginBottom: 6 }}>
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

              {loading ? (
                <ActivityIndicator color="#3B82F6" />
              ) : discsFiltradas.length === 0 ? (
                <Text style={{ color: '#64748B' }}>Nenhuma disciplina encontrada.</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginTop: 4 }}>
                  {discsFiltradas.map(d => {
                    const selected = discSel === d.id_disciplina;
                    return (
                      <TouchableOpacity
                        key={d.id_disciplina}
                        onPress={() => setDiscSel(prev => prev === d.id_disciplina ? null : d.id_disciplina)}
                        style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, backgroundColor: selected ? '#2563EB' : '#0f172a', borderWidth: 1, borderColor: selected ? '#3B82F6' : '#1e293b' }}
                      >
                        <Text style={{ color: selected ? 'white' : '#94A3B8', fontWeight: '600' }}>{d.nome}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </LinearGradient>

          {/* Ações */}
          <View style={{ flexDirection: 'row', gap: 14, marginBottom: 4 }}>
            <TouchableOpacity
              onPress={() => { setProfSel(null); setDiscSel(null); setCursoFiltroId(null); setQProf(''); setQDisc(''); }}
              disabled={submitting}
              style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: '#94A3B8', fontWeight: '700' }}>Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onVincular}
              disabled={submitting}
              style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 5, opacity: submitting ? 0.85 : 1 }}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <><Ionicons name="link-outline" size={18} color="#fff" /><Text style={{ color: 'white', fontWeight: '800' }}>Vincular</Text></>}
            </TouchableOpacity>
          </View>

          {/* Vínculos */}
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#164e6355', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="people" size={20} color="#6EE7B7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Vínculos existentes</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{vinculos.length} registro(s)</Text>
              </View>
              <TouchableOpacity onPress={loadAll} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ paddingVertical: 12 }}><ActivityIndicator color="#3B82F6" /></View>
            ) : vinculos.length === 0 ? (
              <Text style={{ color: '#64748B' }}>Nenhum vínculo encontrado.</Text>
            ) : (
              <View style={{ marginTop: 4 }}>
                {vinculos.map((v, idx) => {
                  const key = `${v.id_usuario}-${v.id_disciplina}`;
                  const isRemoving = removendo === key;
                  return (
                    <View key={key} style={{
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: idx % 2 === 0 ? '#122033' : '#16263a',
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: '#1e2f44',
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>{v.nome_professor}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>Disciplina: {v.nome_disciplina}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => onRemoverVinculo(v.id_usuario, v.id_disciplina)}
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

const inputStyle = {
  color: 'white',
  fontSize: 14,
  paddingVertical: 0,
};
