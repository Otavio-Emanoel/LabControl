import { View, ScrollView, Image, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons';

export default function AgendamentoPage() {
    return (
        <ScrollView className='flex-1 bg-black w-full h-full'>
            <View className='w-full h-1/3 absolute'>
        <Image source={require("../assets/images/bg2.jpg")} className="w-full absolute "/></View>
        <View className='flex-1 flex-row items-center h-full p-16 z-10 font-poppins'>
            <Ionicons name="arrow-back" size={16} color="white" className="mr-4" />
            <Text className='color-white text-xl'>Voltar</Text>
        </View>
        <View className='flex-1 flex-row items-center h-full p-16 z-10 font-poppins flex-1 items-center justify-center'>
            <TouchableOpacity className='bg-[#3B96E2] py-2 px-8 rounded-full'><Text>Professores</Text></TouchableOpacity>
            <TouchableOpacity className='bg-white py-2 px-8 rounded-full'><Text>Organização</Text></TouchableOpacity>
        </View>
        </ScrollView>
    )
}