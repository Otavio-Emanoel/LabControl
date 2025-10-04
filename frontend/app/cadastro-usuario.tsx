import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';

const ROLES = ['Professor', 'Coordenador', 'Auxiliar_Docente'] as const;

type Role = typeof ROLES[number];

export default function CadastroUsuarioScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState<Role>('Professor');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validate = () => {
    if (!nome.trim() || !email.trim() || !senha) return 'Preencha todos os campos.';
    const emailOk = /.+@.+\..+/.test(email.trim());
    if (!emailOk) return 'Informe um e-mail válido.';
    if (senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
    if (!ROLES.includes(cargo)) return 'Selecione um cargo válido.';
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
      await api.post('/auth/register', { nome: nome.trim(), email: email.trim(), senha, cargo });
      Alert.alert('Sucesso', 'Usuário registrado com sucesso!', [
        { text: 'Ok', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        status === 409
          ? 'E-mail já cadastrado.'
          : e?.response?.data?.error || 'Falha ao registrar usuário.';
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
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>Adicionar novo usuário</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Card */}
        <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 16, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="person-add" size={20} color="#93C5FD" />
            <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Cadastro de Usuário</Text>
          </View>

          {errorMsg ? (
            <Text style={{ color: '#F87171' }}>{errorMsg}</Text>
          ) : null}

          {/* Nome */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#9CA3AF' }}>Nome</Text>
            <TextInput
              value={nome}
              onChangeText={setNome}
              placeholder="Nome completo"
              placeholderTextColor="#6B7280"
              style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
            />
          </View>

          {/* Email */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#9CA3AF' }}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="email@exemplo.com"
              placeholderTextColor="#6B7280"
              style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
            />
          </View>

          {/* Senha */}
          <View style={{ gap: 6 }}>
            <Text style={{ color: '#9CA3AF' }}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#6B7280"
              style={{ backgroundColor: '#111827', color: 'white', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1F2937' }}
            />
          </View>

          {/* Cargo */}
          <View style={{ gap: 8 }}>
            <Text style={{ color: '#9CA3AF' }}>Cargo</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {ROLES.map((r) => {
                const selected = cargo === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setCargo(r)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: selected ? '#2563EB' : '#111827',
                      borderWidth: 1,
                      borderColor: selected ? '#3B82F6' : '#1F2937',
                    }}
                  >
                    <Text style={{ color: selected ? 'white' : '#9CA3AF', fontWeight: '600' }}>{r.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Ações */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={submitting}
              style={{ flex: 1, backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>
              )}
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
      </ScrollView>
    </SafeAreaView>
  );
}
