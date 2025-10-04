import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8, flex: 1 }}>Adicionar curso</Text>
        <TouchableOpacity onPress={loadCursos} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Card formulário */}
        <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="library-outline" size={20} color="#93C5FD" />
            <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Cadastro de Curso</Text>
          </View>

          {errorMsg ? <Text style={{ color: '#F87171' }}>{errorMsg}</Text> : null}

          <View style={{ gap: 6 }}>
            <Text style={{ color: '#9CA3AF' }}>Nome do curso</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Ex.: Ciência da Computação"
              placeholderTextColor="#6B7280"
              style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
            />
          </View>

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
              <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Cursos cadastrados</Text>
            </View>
            <TouchableOpacity onPress={loadCursos}>
              <Ionicons name="refresh" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {loadingCursos ? (
            <View style={{ paddingVertical: 8 }}>
              <ActivityIndicator color="#3B82F6" />
            </View>
          ) : errorCursos ? (
            <View style={{ gap: 8 }}>
              <Text style={{ color: '#F87171' }}>{errorCursos}</Text>
              <TouchableOpacity onPress={loadCursos} style={{ alignSelf: 'flex-start', backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : cursos.length === 0 ? (
            <Text style={{ color: '#9CA3AF' }}>Nenhum curso cadastrado.</Text>
          ) : (
            <View style={{ borderWidth: 1, borderColor: '#111827', borderRadius: 12, overflow: 'hidden' }}>
              {cursos.map((c, idx) => (
                <View key={c.id_curso} style={{ paddingHorizontal: 12, paddingVertical: 12, backgroundColor: idx % 2 ? '#0F172A' : '#111827' }}>
                  <Text style={{ color: 'white' }}>{c.nome}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
