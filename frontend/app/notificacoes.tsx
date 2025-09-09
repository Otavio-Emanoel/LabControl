import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Nav from '../components/nav';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useFocusEffect } from '@react-navigation/native';

interface Notificacao {
  id_notificacao: number;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: 0 | 1;
  data_criacao: string;
}

export default function NotificacoesScreen() {
  useAuthGuard();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<Notificacao[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [marcandoTodas, setMarcandoTodas] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Notificacao[]>('/notificacoes');
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log('Falha ao carregar notificações', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const marcarUma = async (id: number) => {
    try {
      await api.post(`/notificacoes/ler/${id}`);
      setList(prev => prev.map(n => n.id_notificacao === id ? { ...n, lida: 1 } : n));
    } catch (e) {
      console.log('Falha ao marcar notificação', e);
    }
  };

  const marcarTodas = async () => {
    try {
      setMarcandoTodas(true);
      await api.post('/notificacoes/ler-todas');
      setList(prev => prev.map(n => ({ ...n, lida: 1 })));
    } catch (e) {
      console.log('Falha ao marcar todas', e);
    } finally {
      setMarcandoTodas(false);
    }
  };

  const renderItem = ({ item }: { item: Notificacao }) => {
    const data = new Date(item.data_criacao);
    const dataFmt = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaFmt = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const linhas = item.mensagem.split('\n');
    return (
      <TouchableOpacity
        onPress={() => marcarUma(item.id_notificacao)}
        style={{ backgroundColor: '#0B1220', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: item.lida ? '#1F2937' : '#2563EB' }}
        activeOpacity={0.75}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name={item.lida ? 'notifications-outline' : 'notifications'} size={16} color={item.lida ? '#9CA3AF' : '#3B82F6'} />
          <Text style={{ color: 'white', fontWeight: '700', marginLeft: 6, flex: 1 }} numberOfLines={2}>{item.titulo}</Text>
          <Text style={{ color: '#6B7280', fontSize: 11 }}>{horaFmt}</Text>
        </View>
        <Text style={{ color: '#D1D5DB', fontSize: 12, lineHeight: 16 }}>
          {linhas.slice(0, 4).join('\n')}{linhas.length > 4 ? '\n...' : ''}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
          <Text style={{ color: '#4B5563', fontSize: 11 }}>{dataFmt}</Text>
          {item.lida === 0 && (
            <View style={{ marginLeft: 8, backgroundColor: '#2563EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>NOVA</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800', flex: 1, marginLeft: 4 }}>Notificações</Text>
        <TouchableOpacity onPress={marcarTodas} disabled={marcandoTodas || list.every(n => n.lida === 1)}>
          <Text style={{ color: (marcandoTodas || list.every(n => n.lida === 1)) ? '#4B5563' : '#3B82F6', fontSize: 12, fontWeight: '600' }}>Ler todas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      ) : list.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Ionicons name="notifications-off-outline" size={54} color="#374151" />
          <Text style={{ color: '#6B7280', marginTop: 16, fontWeight: '600' }}>Nenhuma notificação</Text>
          <TouchableOpacity onPress={load} style={{ marginTop: 20, backgroundColor: '#1F2937', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}>
            <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Atualizar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={i => String(i.id_notificacao)}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 14 }}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        />
      )}

      <Nav active="notificacoes" />
    </View>
  );
}
