import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';

interface Curso { id_curso: number; nome: string }

export default function RemoverCursoScreen() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [removendo, setRemovendo] = useState<number | null>(null);
  const [filtro, setFiltro] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setErro(null);
      setLoading(true);
      const res = await api.get<Curso[]>('/auth/cursos');
      setCursos((res.data as any) || []);
    } catch (e: any) {
      setErro(e?.response?.data?.error || 'Falha ao carregar cursos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cursosFiltrados = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return cursos;
    return cursos.filter(c => c.nome.toLowerCase().includes(q));
  }, [cursos, filtro]);

  const confirmarRemocao = (curso: Curso) => {
    Alert.alert('Remover curso', `Deseja remover o curso "${curso.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => remover(curso.id_curso) }
    ]);
  };

  const remover = async (id: number) => {
    try {
      setRemovendo(id);
      await api.delete(`/auth/curso/${id}`);
      setCursos(prev => prev.filter(c => c.id_curso !== id));
    } catch (e: any) {
      const status = e?.response?.status;
      const msg = status === 409 ? 'Não é possível remover: existem disciplinas vinculadas.' : e?.response?.data?.error || 'Falha ao remover curso.';
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
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Remover Curso</Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Exclua cursos sem disciplinas vinculadas.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 70 }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="library-outline" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Cursos</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{cursosFiltrados.length} de {cursos.length} exibido(s)</Text>
              </View>
              <TouchableOpacity onPress={load} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Field label="Filtrar" icon="search-outline" helper={filtro ? `${cursosFiltrados.length} resultado(s)` : undefined}>
              <TextInput
                value={filtro}
                onChangeText={setFiltro}
                placeholder="Buscar por nome"
                placeholderTextColor="#475569"
                style={inputStyle}
              />
            </Field>

            {erro ? (
              <View style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626', borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 10 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 13 }}>{erro}</Text>
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color="#3B82F6" />
            ) : cursosFiltrados.length === 0 ? (
              <Text style={{ color: '#64748B' }}>Nenhum curso encontrado.</Text>
            ) : (
              <View style={{ marginTop: 4 }}>
                {cursosFiltrados.map((c, idx) => {
                  const isRemoving = removendo === c.id_curso;
                  return (
                    <View key={c.id_curso} style={{ padding: 14, borderRadius: 14, backgroundColor: idx % 2 === 0 ? '#122033' : '#16263a', marginBottom: 10, borderWidth: 1, borderColor: '#1e2f44', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: '600' }}>{c.nome}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => confirmarRemocao(c)}
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
