import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/nav';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { api } from '@/lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

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
      // tenta pegar do storage primeiro (salvo no login)
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
      // garante dados atualizados via /auth/me
      const res = await api.get<UserMe>('/auth/me');
      const me = res.data?.user;
      if (me) {
        setNome(me.nome || '');
        setCargo(me.cargo || '');
      }
    } catch (err) {
      // se falhar, o guard deve redirecionar
      console.log('Falha ao carregar usuário:', err);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Recarrega dados sempre que a tela volta a ficar ativa
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
      // limpa estados locais e volta para login
      setNome('');
      setEmail('');
      setCargo('');
      router.replace('/login');
    }
  };

  const isAux = cargo === 'Auxiliar_Docente' || (typeof cargo === 'string' && cargo.toLowerCase().includes('auxiliar'));
  const isCoord = cargo === 'Coordenador' || (typeof cargo === 'string' && cargo.toLowerCase().includes('coordenador'));

  return (
    <View style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      {/* Bloco cinza contendo perfil e menu */}
      <View
        style={{
          backgroundColor: '#1F2937',
          borderRadius: 16,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 150,
          gap: 24,
          marginTop: 40,
        }}
      >
        {/* Header do perfil */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#374151',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="person" size={40} color="white" />
          </View>

          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{nome || 'Usuário'}</Text>
          <Text style={{ color: '#3B82F6' }}>{email || 'Email não disponível'}</Text>
          <Text style={{ color: '#9CA3AF' }}>{cargo ? `Cargo: ${cargo}` : ''}</Text>
        </View>

        {/* Menu */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#111827',
              borderRadius: 12,
            }}
          >
            <Text style={{ color: 'white' }}>Gerenciar senha</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/agendamento')}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#111827',
              borderRadius: 12,
            }}
          >
            <Text style={{ color: 'white' }}>Agendar laboratório</Text>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* Botão visível apenas para Auxiliar Docente */}
          {isAux && (
            <TouchableOpacity
              onPress={() => router.push('/cadastro-usuario' as any)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#111827',
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white' }}>Adicionar novo usuário</Text>
              <Ionicons name="person-add" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Adicionar curso - somente Auxiliar_Docente */}
          {isAux && (
            <TouchableOpacity
              onPress={() => router.push('/adicionar-curso' as any)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#111827',
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white' }}>Adicionar curso</Text>
              <Ionicons name="library-outline" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Adicionar disciplina - Auxiliar_Docente e Coordenador */}
          {(isAux || isCoord) && (
            <TouchableOpacity
              onPress={() => router.push('/adicionar-disciplina' as any)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#111827',
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white' }}>Adicionar disciplina</Text>
              <Ionicons name="book-outline" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* Atribuir aula a professor - Auxiliar_Docente e Coordenador */}
          {(isAux || isCoord) && (
            <TouchableOpacity
              onPress={() => router.push('/atribuir-aula' as any)}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                backgroundColor: '#111827',
                borderRadius: 12,
              }}
            >
              <Text style={{ color: 'white' }}>Atribuir aula a professor</Text>
              <Ionicons name="people-outline" size={20} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={sair}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 16,
              backgroundColor: '#B91C1C',
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Navbar active="perfil" />            
    </View>
  );
}
