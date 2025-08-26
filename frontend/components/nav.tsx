import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from '@expo/vector-icons';


export default function Nav(){
    return (
        <View className="flex-1 flex-row fixed bottom-0 w-full px-16 items-center justify-center gap-8">
            <TouchableOpacity className="bg-[#1C4AEDB2] w-16 h-16 flex items-center justify-center rounded-3xl">   {/* Ícone de Casa */}
                <Ionicons name="home-outline" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#1C4AEDB2] w-16 h-16 flex items-center justify-center rounded-3xl">
                         {/* Ícone de Lupa (Buscar) */}
            <Ionicons name="search-outline" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#1C4AEDB2] w-16 h-16 flex items-center justify-center rounded-3xl">
                         {/* Ícone de Relógio */}
            <Ionicons name="time-outline" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#1C4AEDB2] w-16 h-16 flex items-center justify-center rounded-3xl">  
                  {/* Ícone de Usuário */}
            <Ionicons name="person-outline" size={30} color="black" />
            </TouchableOpacity>
        </View>
    )
}