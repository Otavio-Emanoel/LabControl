import React from 'react';
import { View, Text, FlatList } from 'react-native';

const notifications = [
  { id: '1', date: '30/08/2025 Terça-feira', message: 'Seu pedido foi enviado!', type: 'Notificação' },
  { id: '2', date: '29/08/2025 Segunda-feira', message: 'Nova mensagem na caixa de entrada.', type: 'Notificação' },
];

export default function Notifications() {
  return (
    <View className="flex-1 bg-black p-4">
      <Text className="text-white text-2xl font-bold mb-4">Notificações</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-4">
            <Text className="text-gray-400 text-xs mb-1">{item.date}</Text>
            <View className="bg-gray-800 rounded-xl p-4 flex-row justify-between items-center shadow-md">
              <Text className="text-white flex-1">{item.message}</Text>
              <Text className="text-gray-400 text-sm ml-2">{item.type}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
