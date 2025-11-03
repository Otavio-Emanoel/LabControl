import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, SafeAreaView, Platform, TouchableOpacity, TextInput, FlatList, Modal, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '@/components/BackButton';
import ConnectionBadge from '@/components/ConnectionBadge';

type Lab = {
  id_Laboratorio: number;
  numero: string;
  descricao?: string | null;
};

export default function GerenciarLabsScreen() {
  useAuthGuard();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const [cargo, setCargo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [numero, setNumero] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  const isAux = useMemo(() => cargo === 'Auxiliar_Docente' || cargo?.toLowerCase?.().includes('auxiliar'), [cargo]);

  const loadMe = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        setCargo(u?.cargo || '');
      }
    } catch {}
  }, []);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Lab[]>('/labs/all');
      setLabs((res.data as any) || []);
    } catch (err) {
      console.log('Falha ao carregar labs', err);
      Alert.alert('Erro', 'Não foi possível carregar os laboratórios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);
  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!isAux && cargo) {
      // Sem permissão, volta para o perfil
      router.replace('/user');
    }
  }, [isAux, cargo, router]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return labs;
    return labs.filter(l =>
      l.numero.toLowerCase().includes(t) || (l.descricao || '').toLowerCase().includes(t)
    );
  }, [q, labs]);

  const openNew = () => {
    setEditing(null);
    setNumero('');
    setDescricao('');
    setModalOpen(true);
  };

  const openEdit = (lab: Lab) => {
    setEditing(lab);
    setNumero(lab.numero || '');
    setDescricao(lab.descricao || '');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const salvar = async () => {
    if (!numero.trim()) { Alert.alert('Validação', 'O campo "número" é obrigatório.'); return; }
    try {
      setSaving(true);
      if (!editing) {
        // criar
        await api.post('/labs', { numero: numero.trim(), descricao: descricao.trim() || null });
      } else {
        // editar (não há endpoint no backend hoje). Tentamos PATCH e tratamos mensagem amigável.
        try {
          await api.patch(`/labs/${editing.id_Laboratorio}`, { numero: numero.trim(), descricao: descricao.trim() });
        } catch (e: any) {
          const msg = e?.response?.data?.error || e?.message || '';
          Alert.alert(
            'Atualizar laboratório',
            'O backend atual não possui endpoint de edição para laboratórios. Posso adicionar um PATCH/PUT no backend depois. Por enquanto, é possível apenas adicionar e remover.'
          );
        }
      }
      await carregar();
      setModalOpen(false);
    } catch (err: any) {
      const code = err?.response?.status;
      if (code === 409) {
        Alert.alert('Duplicado', err?.response?.data?.message || 'Já existe laboratório com este número.');
      } else {
        Alert.alert('Erro', err?.response?.data?.error || 'Falha ao salvar laboratório.');
      }
    } finally {
      setSaving(false);
    }
  };

  const remover = (lab: Lab) => {
    Alert.alert('Confirmar', `Remover o laboratório "${lab.numero}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          try {
            setSaving(true);
            await api.delete(`/labs/${lab.id_Laboratorio}`);
            await carregar();
          } catch (err: any) {
            const status = err?.response?.status;
            if (status === 409) {
              Alert.alert('Em uso', err?.response?.data?.message || 'Este laboratório possui vínculos e não pode ser removido.');
            } else if (status === 404) {
              Alert.alert('Não encontrado', 'Laboratório não existe mais.');
            } else {
              Alert.alert('Erro', 'Falha ao remover laboratório.');
            }
          } finally {
            setSaving(false);
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: Lab }) => (
    <View style={{ width: isWeb ? 560 : '100%' }}>
      <View style={{ padding: 14, backgroundColor: '#111827', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }}>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Laboratório {item.numero}</Text>
        {!!item.descricao && <Text style={{ color: '#9CA3AF', marginTop: 4 }}>{item.descricao}</Text>}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={() => openEdit(item)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0B1220', borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#93C5FD', fontWeight: '700' }}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => remover(item)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1F2937' }}>
            <Text style={{ color: '#EF4444', fontWeight: '700' }}>Remover</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ position: 'absolute', top: 12, right: isWeb ? 20 : 12, zIndex: 50 }}>
        <ConnectionBadge />
      </View>

      <View
        style={{
          width: '100%',
          maxWidth: isWeb ? 1200 : undefined,
          alignSelf: 'center',
          paddingHorizontal: isWeb ? 24 : 16,
          paddingTop: Platform.OS === 'android' ? 30 : 12,
          flex: 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BackButton onPress={() => router.replace('/user')} />
          <Text style={{ color: 'white', fontSize: isWeb ? 22 : 20, fontWeight: '800', marginLeft: 8 }}>Gerenciar Laboratórios</Text>
          <View style={{ marginLeft: 'auto' }} />
        </View>

        {/* Barra de ações */}
        <View style={{ marginTop: 16, flexDirection: isWeb ? 'row' : 'column', gap: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1F2937' }}>
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar por número ou descrição"
              placeholderTextColor="#6B7280"
              style={{ flex: 1, color: 'white', padding: 10 }}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity onPress={openNew} style={{ alignSelf: isWeb ? 'auto' : 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={{ color: 'white', fontWeight: '800', marginLeft: 6 }}>Novo laboratório</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#3B82F6" size="large" />
          </View>
        ) : (
          <FlatList
            style={{ marginTop: 12 }}
            data={filtered}
            keyExtractor={(item) => String(item.id_Laboratorio)}
            numColumns={isWeb ? 2 : 1}
            columnWrapperStyle={isWeb ? { justifyContent: 'space-between', gap: 12 } : undefined}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 140 }}
            ListEmptyComponent={() => (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Text style={{ color: '#6B7280' }}>Nenhum laboratório encontrado.</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Modal criar/editar */}
      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <View style={{ width: '92%', maxWidth: 640, backgroundColor: '#0B1220', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#1F2937' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '800', flex: 1 }}>{editing ? 'Editar laboratório' : 'Novo laboratório'}</Text>
              <TouchableOpacity onPress={closeModal} disabled={saving}>
                <Text style={{ color: '#9CA3AF', fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Número</Text>
            <TextInput value={numero} onChangeText={setNumero} placeholder="Ex.: lab2" placeholderTextColor="#6B7280" style={{ backgroundColor: '#111827', borderRadius: 10, padding: 10, color: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }} />
            <Text style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 6 }}>Descrição (opcional)</Text>
            <TextInput value={descricao} onChangeText={setDescricao} placeholder="Ex.: Laboratório de Hardware" placeholderTextColor="#6B7280" style={{ backgroundColor: '#111827', borderRadius: 10, padding: 10, color: 'white', marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }} />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
              <TouchableOpacity onPress={closeModal} disabled={saving} style={{ paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text style={{ color: '#9CA3AF', fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={salvar} disabled={saving} style={{ backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: 'white', fontWeight: '800' }}>Salvar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
