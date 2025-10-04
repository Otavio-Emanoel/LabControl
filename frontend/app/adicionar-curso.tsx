import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

interface Curso {
  id_curso: number;
  nome: string;
}

export default function AdicionarCursoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errorCursos, setErrorCursos] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');

  const loadCursos = useCallback(async () => {
    try {
      setErrorCursos(null);
      setLoadingCursos(true);
      const res = await api.get<Curso[]>('/auth/cursos');
      setCursos((res.data as any) || []);
    } catch {
      setErrorCursos('Erro ao carregar cursos.');
    } finally {
      setLoadingCursos(false);
    }
  }, []);

  useEffect(() => {
    loadCursos();
  }, [loadCursos]);

  const validate = () => {
    if (!nome.trim()) return 'Informe o nome do curso.';
    if (nome.trim().length < 3) return 'O nome do curso deve ter pelo menos 3 caracteres.';
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
      await api.post('/auth/curso', { nome: nome.trim() });
      Alert.alert('Sucesso', 'Curso adicionado com sucesso!');
      setNome('');
      loadCursos();
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 403
          ? 'Apenas Auxiliar Docente pode adicionar curso.'
          : e?.response?.data?.error || 'Falha ao adicionar curso.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const cursosFiltrados = cursos.filter(c => c.nome.toLowerCase().includes(filtro.trim().toLowerCase()));

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
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Novo Curso</Text>
          <Text style={{ color: '#64748B', marginTop: 4, fontSize: 13 }}>Cadastre um novo curso e visualize os existentes.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#1e293b', '#101827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a', marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="library-outline" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Cadastro de Curso</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>Informe o nome do curso (mínimo 3 caracteres).</Text>
              </View>
              <TouchableOpacity onPress={loadCursos} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {errorMsg ? (
              <View style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626', borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 13 }}>{errorMsg}</Text>
              </View>
            ) : null}

            <Field label="Nome do curso" icon="albums-outline">
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Ex.: Ciência da Computação"
                placeholderTextColor="#64748B"
                style={inputStyle}
              />
            </Field>

            <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
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
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Cursos cadastrados</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>{cursos.length} registro(s)</Text>
              </View>
              <TouchableOpacity onPress={loadCursos} style={{ padding: 6 }}>
                <Ionicons name="refresh" size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Filtro */}
            {cursos.length > 0 && (
              <Field label="Filtrar" icon="search-outline" helper={filtro ? `${cursosFiltrados.length} resultado(s)` : undefined}>
                <TextInput
                  value={filtro}
                  onChangeText={setFiltro}
                  placeholder="Buscar por nome"
                  placeholderTextColor="#475569"
                  style={inputStyle}
                />
              </Field>
            )}

            {loadingCursos ? (
              <View style={{ paddingVertical: 12 }}><ActivityIndicator color="#3B82F6" /></View>
            ) : errorCursos ? (
              <View style={{ gap: 8 }}>
                <Text style={{ color: '#F87171' }}>{errorCursos}</Text>
                <TouchableOpacity onPress={loadCursos} style={{ alignSelf: 'flex-start', backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#334155' }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : cursosFiltrados.length === 0 ? (
              <Text style={{ color: '#64748B', marginTop: 6 }}>Nenhum curso encontrado.</Text>
            ) : (
              <View style={{ marginTop: 4 }}>
                {cursosFiltrados.map((c, idx) => (
                  <View key={c.id_curso} style={{
                    padding: 14,
                    borderRadius: 14,
                    backgroundColor: idx % 2 === 0 ? '#122033' : '#16263a',
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#1e2f44'
                  }}>
                    <Text style={{ color: 'white', fontWeight: '600' }}>{c.nome}</Text>
                  </View>
                ))}
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
