import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import ConnectionBadge from '@/components/ConnectionBadge';
import BackButton from '@/components/BackButton';
import { LinearGradient } from 'expo-linear-gradient';

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
      <LinearGradient colors={['#05080eff', '#0a0f1c']} style={{ position: 'absolute', inset: 0 as any }} />
      <View style={{ position: 'absolute', top: 12, right: 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>

      {/* Header melhorado */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4, marginTop: 20 }}>
        <View style={{ width: 100 }}>
          <BackButton variant="glass" size="sm" onPress={() => router.back()} />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: 0.5 }}>Novo Usuário</Text>
          <Text style={{ color: '#64748B', marginTop: 4, fontSize: 13 }}>Preencha os dados abaixo para registrar um novo acesso.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Container gradiente */}
          <LinearGradient
            colors={['#1e293b', '#101827']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#22324a' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#1E3A8A55', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="person-add" size={22} color="#93C5FD" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#E2E8F0', fontSize: 16, fontWeight: '700' }}>Cadastro de Usuário</Text>
                <Text style={{ color: '#64748B', fontSize: 12 }}>Defina cargo e credenciais do novo usuário.</Text>
              </View>
            </View>

            {errorMsg ? (
              <View style={{ backgroundColor: '#7f1d1d', borderColor: '#dc2626', borderWidth: 1, padding: 10, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ color: '#FCA5A5', fontSize: 13 }}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Nome */}
            <Field label="Nome" icon="person-outline">
              <TextInput
                value={nome}
                onChangeText={setNome}
                placeholder="Nome completo"
                placeholderTextColor="#64748B"
                style={inputStyle}
              />
            </Field>

            {/* Email */}
            <Field label="E-mail" icon="mail-outline">
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="email@exemplo.com"
                placeholderTextColor="#64748B"
                style={inputStyle}
              />
            </Field>

            {/* Senha */}
            <Field label="Senha" icon="lock-closed-outline" helper="Mínimo 6 caracteres" >
              <TextInput
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                placeholder="••••••"
                placeholderTextColor="#64748B"
                style={inputStyle}
              />
            </Field>

            {/* Cargo */}
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 6, fontWeight: '600' }}>Cargo</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {ROLES.map(r => {
                  const active = cargo === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      onPress={() => setCargo(r)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                        backgroundColor: active ? '#2563EB' : '#0f172a',
                        borderWidth: 1,
                        borderColor: active ? '#3B82F6' : '#1e293b',
                        shadowColor: '#000',
                        shadowOpacity: active ? 0.35 : 0.15,
                        shadowRadius: active ? 8 : 4,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: active ? 5 : 2,
                      }}
                    >
                      <Text style={{ color: active ? 'white' : '#94A3B8', fontWeight: '600', fontSize: 12 }}>{r.replace('_', ' ')}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Ações */}
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 26 }}>
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
                style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6, opacity: submitting ? 0.8 : 1 }}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color="#fff" />
                    <Text style={{ color: 'white', fontWeight: '800', letterSpacing: 0.5 }}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Componente reutilizável para campo com ícone e label
function Field({ label, icon, children, helper }: { label: string; icon: any; children: React.ReactNode; helper?: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', paddingHorizontal: 12, height: 54 }}>
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
