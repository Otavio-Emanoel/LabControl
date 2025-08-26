import { Text, View, ScrollView, TextInput } from "react-native";
import Nav from "@/components/nav";


export default function Index() {
  return (
    <ScrollView className="h-screen bg-gradient-to-b from-[#1484fc] to-white">
      <View className="h-[100px] w-full"></View>
      <View className="flex-1 align-center justify-left px-12 py-12">
        <Text className="text-xs text-[#3B3B3B] font-madimi">Olá User</Text>
        <Text className="text-3xl text-white font-bold font-madimi">Bem vindo</Text>
        <TextInput className="bg-white p-4 pl-16 rounded-full mt-4" placeholder="Pesquise aqui" ></TextInput>
        <View className="bg-[#1B283880] w-full h-16 my-4 rounded-2xl">
           </View>

      </View>
      
      <Nav></Nav>

    </ScrollView>
  );
}
