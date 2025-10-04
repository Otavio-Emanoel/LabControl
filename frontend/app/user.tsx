import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/nav';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import ConnectionBadge from '@/components/ConnectionBadge';

interface UserMe {
  user?: {
    sub: number;
    nome: string;
    cargo: string;
  };
}

export default function ProfileScreen() {
  useAuthGuard();
  const router = useRouter();
  const [nome, setNome] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [cargo, setCargo] = useState<string>('');

  const loadUser = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('auth_user');
      if (stored) {
        const u = JSON.parse(stored);
        setNome(u?.nome || '');
        setEmail(u?.email || '');
        setCargo(u?.cargo || '');
      } else {
        setNome('');
        setEmail('');
        setCargo('');
      }
      const res = await api.get<UserMe>('/auth/me');
      const me = res.data?.user;
      if (me) {
        setNome(me.nome || '');
        setCargo(me.cargo || '');
      }
    } catch (err) {
      console.log('Falha ao carregar usuário:', err);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
      return () => {};
    }, [loadUser])
  );

  const sair = async () => {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    } finally {
      setNome('');
      setEmail('');
      setCargo('');
      router.replace('/login');
    }
  };

  const isAux = cargo === 'Auxiliar_Docente' || (typeof cargo === 'string' && cargo.toLowerCase().includes('auxiliar'));
  const isCoord = cargo === 'Coordenador' || (typeof cargo === 'string' && cargo.toLowerCase().includes('coordenador'));

  const initials = (nome || 'U')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc, part, idx, arr) => (idx === 0 || idx === arr.length - 1 ? acc + (part[0] || '') : acc), '')
    .toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Header com imagem de fundo */}
        <ImageBackground
          source={require('../assets/images/home-background.jpg')}
          style={{ height: 220, borderRadius: 20, overflow: 'hidden' }}
          imageStyle={{ transform: [{ scale: 1.05 }] }}
        >
          <View style={{ position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.45)' }} />
          <View style={{ flex: 1, padding: 16, justifyContent: 'flex-end' }}>
            {/* Avatar com anel */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' }}>
                <Text style={{ color: 'white', fontSize: 26, fontWeight: '800' }}>{initials || 'U'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }} numberOfLines={1}>{nome || 'Usuário'}</Text>
                {email ? <Text style={{ color: '#BFDBFE' }} numberOfLines={1}>{email}</Text> : null}
                {cargo ? (
                  <View style={{ alignSelf: 'flex-start', marginTop: 6, backgroundColor: 'rgba(37,99,235,0.25)', borderColor: '#3B82F6', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>{cargo.replace('_', ' ')}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Ações principais */}
        <View style={{ marginTop: 18, gap: 12 }}>
          <Text style={{ color: '#9CA3AF', fontSize: 12, letterSpacing: 1 }}>AÇÕES</Text>

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="key-outline" size={18} color="#93C5FD" />
            </View>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Gerenciar senha</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/agendamento')}
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
          >
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="calendar-outline" size={18} color="#93C5FD" />
            </View>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Agendar laboratório</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Administração */}
        {(isAux || isCoord) && (
          <View style={{ marginTop: 18, gap: 12 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 12, letterSpacing: 1 }}>ADMINISTRAÇÃO</Text>

            {isAux && (
              <TouchableOpacity
                onPress={() => router.push('/cadastro-usuario' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="person-add-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Adicionar novo usuário</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {isAux && (
              <TouchableOpacity
                onPress={() => router.push('/usuarios' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="people-circle-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Gerenciar usuários</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {isAux && (
              <TouchableOpacity
                onPress={() => router.push('/adicionar-curso' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="library-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Adicionar curso</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {isAux && (
              <TouchableOpacity
                onPress={() => router.push('/remover-curso' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Remover curso</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {(isAux || isCoord) && (
              <TouchableOpacity
                onPress={() => router.push('/adicionar-disciplina' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="book-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Adicionar disciplina</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {(isAux || isCoord) && (
              <TouchableOpacity
                onPress={() => router.push('/remover-disciplina' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="trash-bin-outline" size={18} color="#F87171" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Remover disciplina</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {(isAux || isCoord) && (
              <TouchableOpacity
                onPress={() => router.push('/atribuir-aula' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="people-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Atribuir aula a professor</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}

            {(isAux || isCoord) && (
              <TouchableOpacity
                onPress={() => router.push('/tornar-fixo' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#0B1220', borderRadius: 14, borderWidth: 1, borderColor: '#111827' }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name="infinite-outline" size={18} color="#93C5FD" />
                </View>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600', flex: 1 }}>Tornar agendamento fixo</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sair */}
        <View style={{ marginTop: 24 }}>
          <TouchableOpacity
            onPress={sair}
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: '#B91C1C', borderRadius: 14 }}
          >
            <Ionicons name="exit-outline" size={18} color="#fff" />
            <Text style={{ color: 'white', fontWeight: '800', marginLeft: 8 }}>Sair</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', top: 12, right: 12 }}>
        <ConnectionBadge />
      </View>

      <Navbar active="perfil" />
    </SafeAreaView>
  );
}
