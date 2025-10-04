import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, FlatList, TextInput, TouchableOpacity, Modal, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import Navbar from '@/components/nav';
import ConnectionBadge from '@/components/ConnectionBadge';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import BackButton from '@/components/BackButton';

interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  cargo: string;
}

const cargos = ['Professor', 'Auxiliar_Docente', 'Coordenador'];

export default function UsuariosScreen() {
  useAuthGuard();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtered, setFiltered] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Usuario | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCargo, setFormCargo] = useState('Professor');
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Usuario[]>('/auth/usuarios');
      setUsuarios(res.data as any);
      setFiltered(res.data as any);
    } catch (err: any) {
      console.log('Erro ao listar usuarios', err?.response?.data || err.message);
      Alert.alert('Erro', 'Falha ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!q.trim()) { setFiltered(usuarios); return; }
    const lower = q.toLowerCase();
    setFiltered(usuarios.filter(u => u.nome.toLowerCase().includes(lower) || u.email.toLowerCase().includes(lower) || u.cargo.toLowerCase().includes(lower)));
  }, [q, usuarios]);

  const abrirModal = (u: Usuario) => {
    setSelected(u);
    setFormNome(u.nome);
    setFormEmail(u.email);
    setFormCargo(u.cargo);
    setModalVisible(true);
  };

  const fecharModal = () => {
    setModalVisible(false);
    setSelected(null);
  };

  const salvar = async () => {
    if (!selected) return;
    if (!formNome.trim()) { Alert.alert('Validação', 'Nome obrigatório.'); return; }
    if (!formEmail.trim()) { Alert.alert('Validação', 'E-mail obrigatório.'); return; }
    try {
      setSaving(true);
      const body: any = {};
      if (formNome !== selected.nome) body.nome = formNome.trim();
      if (formEmail !== selected.email) body.email = formEmail.trim();
      if (formCargo !== selected.cargo) body.cargo = formCargo;
      if (Object.keys(body).length === 0) {
        Alert.alert('Sem mudanças', 'Nada para atualizar.');
        return;
      }
      const res = await api.patch(`/auth/usuario/${selected.id_usuario}`, body);
      const updated = res.data?.user as Usuario;
      setUsuarios(prev => prev.map(u => u.id_usuario === updated.id_usuario ? updated : u));
      setFiltered(prev => prev.map(u => u.id_usuario === updated.id_usuario ? updated : u));
      fecharModal();
    } catch (err: any) {
      console.log('Erro atualizar', err?.response?.data || err.message);
      Alert.alert('Erro', err?.response?.data?.error || 'Falha ao atualizar.');
    } finally {
      setSaving(false);
    }
  };

  const remover = async () => {
    if (!selected) return;
    Alert.alert('Confirmar', 'Remover este usuário?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        try {
          setSaving(true);
          await api.delete(`/auth/usuario/${selected.id_usuario}`);
          setUsuarios(prev => prev.filter(u => u.id_usuario !== selected.id_usuario));
          setFiltered(prev => prev.filter(u => u.id_usuario !== selected.id_usuario));
          fecharModal();
        } catch (err: any) {
          console.log('Erro remover', err?.response?.data || err.message);
          Alert.alert('Erro', err?.response?.data?.error || 'Falha ao remover.');
        } finally {
          setSaving(false);
        }
      }}
    ]);
  };

  const renderItem = ({ item }: { item: Usuario }) => (
    <TouchableOpacity onPress={() => abrirModal(item)} style={{ padding: 14, backgroundColor: '#111827', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1F2937' }}>
      <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{item.nome}</Text>
      <Text style={{ color: '#9CA3AF', fontSize: 12 }}>{item.email}</Text>
      <View style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: 'rgba(37,99,235,0.25)', borderColor: '#3B82F6', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 11 }}>{item.cargo.replace('_', ' ')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 30 : 10 }}>
        <BackButton onPress={() => router.back()} />
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', marginLeft: 8 }}>Usuários</Text>
        <View style={{ marginLeft: 'auto' }}><ConnectionBadge /></View>
      </View>

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' }}>
          <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar por nome, email ou cargo"
              placeholderTextColor="#6B7280"
              style={{ flex: 1, color: 'white', padding: 10 }}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={carregar}>
              <Ionicons name="refresh" size={20} color="#93C5FD" />
            </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3B82F6" size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id_usuario)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ color: '#6B7280' }}>Nenhum usuário encontrado.</Text>
            </View>
          )}
        />
      )}

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={fecharModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#0B1220', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Editar Usuário</Text>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Nome</Text>
            <TextInput value={formNome} onChangeText={setFormNome} style={{ backgroundColor: '#111827', borderRadius: 10, padding: 10, color: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }} />
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Email</Text>
            <TextInput value={formEmail} onChangeText={setFormEmail} autoCapitalize='none' keyboardType='email-address' style={{ backgroundColor: '#111827', borderRadius: 10, padding: 10, color: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }} />
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Cargo</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {cargos.map(c => {
                const active = formCargo === c;
                return (
                  <TouchableOpacity key={c} onPress={() => setFormCargo(c)} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? '#2563EB' : '#111827', borderWidth: 1, borderColor: active ? '#3B82F6' : '#1F2937' }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{c.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity disabled={saving} onPress={fecharModal} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ color: '#9CA3AF', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} onPress={remover} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                <Text style={{ color: '#EF4444', fontWeight: '700' }}>Remover</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={saving} onPress={salvar} style={{ backgroundColor: '#2563EB', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10 }}>
                {saving ? <ActivityIndicator color='white' /> : <Text style={{ color: 'white', fontWeight: '700' }}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Navbar active={null as any} />
    </SafeAreaView>
  );
}
