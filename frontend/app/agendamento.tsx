import { View, ScrollView } from 'react-native';
import axios from 'axios';
import { useState, useEffect } from 'react';
import LabCard from '@/components/labCard';

interface Lab {
  nome: string;
}

export default function AgendamentoPage() {
  const [labs, setLabs] = useState<Lab[]>([]);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/labs/all"); 
        setLabs(res.data);
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };
    fetchLabs();
  }, []);

  return (
    <ScrollView>
      <View>
        {labs.map((lab, index) => (
          <LabCard labName={lab.nome} key={index} />
        ))}
      </View>
    </ScrollView>
  );
}
