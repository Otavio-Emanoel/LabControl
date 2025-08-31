import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/nav';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function ProfileScreen() {

    useAuthGuard();
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

                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>NOME</Text>
                    <Text style={{ color: '#3B82F6' }}>Email.institucional</Text>
                    <Text style={{ color: '#9CA3AF' }}>RM: 00000, Matéria</Text>
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
                        <Text style={{ color: 'white' }}>Aulas do dia</Text>
                        <Ionicons name="chevron-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <Navbar active="perfil" />            
        </View>
    );
}
