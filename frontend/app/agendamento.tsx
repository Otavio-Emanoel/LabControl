import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LabCard from '@/components/labCard';
import { api, getApiBaseUrl } from '@/lib/api';

import { useAuthGuard } from '@/hooks/useAuthGuard';
import Nav from '@/components/nav';

interface Lab {
  numero: string;
}

export default function AgendamentoPage() {
  const [selected, setSelected] = useState<'professores' | 'organizacao'>('professores');
  const [labs, setLabs] = useState<Lab[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  useAuthGuard();
  
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        setErrorMsg(null);
        const res = await api.get(`/labs/all`);
        setLabs(res.data);
      } catch (error: any) {
        console.error("Error fetching labs:", error);
        const base = getApiBaseUrl();
        setErrorMsg(error?.message === 'Network Error' ? `Falha de rede. Verifique se o servidor (${base}) está acessível.` : 'Erro ao buscar laboratórios.');
      }
    };
    fetchLabs();
  }, []);

  return (
    <ScrollView className='flex-1 bg-black'>
      {/* background image */}
      <View style={{ width: '100%', height: '33%', position: 'absolute', top: 0, left: 0 }}>
        <Image source={require("../assets/images/bg2.jpg")} style={{ width: '100%', height: '100%' }} />
      </View>
        <Link href="/" className='flex-1 flex-row items-center h-full p-16 z-10'>
            <Ionicons name="arrow-back" size={16} color="white" className="mr-4" />
            <Text className='color-white text-xl font-poppins'>Voltar</Text>
        </Link>
        <View className='flex-row items-center mx-auto rounded-full h-8 z-10 bg-white w-[90%] items-center justify-center'>
            <TouchableOpacity 
              className={`w-[50%] h-8 flex items-center justify-center rounded-full ${selected === 'professores' ? 'bg-[#3B96E2]' : ''}`} 
              onPress={() => setSelected('professores')}
            >
              <Text className={`font-poppins ${selected === 'professores' ? 'color-white' : ''}`}>Professores</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className={`w-[50%] h-8 flex items-center justify-center rounded-full ${selected === 'organizacao' ? 'bg-[#3B96E2]' : ''}`} 
              onPress={() => setSelected('organizacao')}
            >
              <Text className={`font-poppins ${selected === 'organizacao' ? 'color-white' : ''}`}>Organização</Text>
            </TouchableOpacity>
        </View>
      <View>
        {errorMsg ? (
          <Text className='text-red-400 text-center mt-4'>{errorMsg}</Text>
        ) : null}
        {labs.map((lab, index) => (
          <LabCard labName={lab.numero} key={index} />
        ))}
      </View>
      <Nav active="agendamento"/>
    </ScrollView>
  );
}
