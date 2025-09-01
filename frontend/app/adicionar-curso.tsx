import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdicionarCursoScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: 'black', padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>Adicionar curso</Text>
      </View>

      <View style={{ backgroundColor: '#1F2937', borderRadius: 16, padding: 20, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="library-outline" size={20} color="#93C5FD" />
          <Text style={{ color: '#D1D5DB', fontSize: 16, fontWeight: '600' }}>Cadastro de Curso</Text>
        </View>
        <Text style={{ color: '#9CA3AF' }}>Tela de cadastro de curso. Será incrementada com formulário e integração.</Text>
      </View>
    </View>
  );
}
