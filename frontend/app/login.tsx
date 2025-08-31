import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);

  const logar = () => {
    axios.post("http://localhost:3000/auth/login", {
      email,
      password,
    })
      .then((response: { data: any }) => {
        console.log("Login successful:", response.data);
      })
      .catch((error: any) => {
        console.error("Login error:", error);
      });
  }

  return (
    <View className="flex-1 bg-[#0B0B0F]">
      <StatusBar style="light" />
      {/* Eclipses decorativos (posicionamento mais fiel ao mock) */}
      <Image
        source={require("../assets/images/login-eclipse.png")}
        className="absolute -top-6 -right-16 w-[360px] h-[360px] opacity-40"
        resizeMode="contain"
      />
      {/* Opcional: segunda curva para reforçar o arco, se existir o arquivo */}
      <Image
        source={require("../assets/images/login-eclipse-2.png")}
        className="absolute top-10 -right-24 w-[300px] h-[260px] opacity-25"
        resizeMode="stretch"
      />

      {/* Conteúdo */}
      <View className="flex-1 justify-center px-6 pt-6 pb-20">
        {/* Logo/Marca */}
        <View className="w-10 h-10 bg-white rounded-lg mb-4" />

        {/* Títulos */}
        <Text className="text-white font-bold text-3xl leading-tight">Bem vindo</Text>
        <Text className="text-[#B1B1B8] mt-1">Faça login para ter acesso à sua conta</Text>

        {/* Barra de progresso */}
        <View className="w-full h-[3px] bg-[#1B1C20] rounded-full mt-4 overflow-hidden">
          <View className="h-full w-[68%] bg-[#070E98]" />
        </View>

        {/* Campo Email */}
        <Text className="text-[#C9C9CF] text-base ml-1 mt-6">Email</Text>
        <View className="bg-[#F0F2F9] h-12 rounded-xl flex-row items-center px-3 mt-2">
          <View className="w-8 h-8 rounded-md bg-[#E6E9F2] items-center justify-center">
            <Ionicons name="mail-outline" size={18} color="#7D7F86" />
          </View>
          <TextInput
            className="flex-1 ml-3 text-[#111827]"
            placeholder="Insira seu e-mail"
            placeholderTextColor="#828282"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Campo Senha */}
        <Text className="text-[#C9C9CF] text-base ml-1 mt-4">Password</Text>
        <View className="bg-[#F0F2F9] h-12 rounded-xl flex-row items-center px-3 mt-2">
          <View className="w-8 h-8 rounded-md bg-[#E6E9F2] items-center justify-center">
            <Ionicons name="lock-closed-outline" size={18} color="#7D7F86" />
          </View>
          <TextInput
            className="flex-1 ml-3 text-[#111827]"
            placeholder="Senha..."
            placeholderTextColor="#828282"
            secureTextEntry={hidePassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setHidePassword((v) => !v)}
            className="w-8 h-8 rounded-md bg-[#E6E9F2] items-center justify-center"
          >
            <Ionicons
              name={hidePassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#7D7F86"
            />
          </TouchableOpacity>
        </View>

        {/* Lembre-se de mim */}
        <View className="flex-row items-center mt-3">
          <TouchableOpacity
            className="w-5 h-5 rounded border border-[#5E5E66] items-center justify-center"
            onPress={() => setRemember((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: remember }}
          >
            {remember ? <Ionicons name="checkmark" size={16} color="#070E98" /> : null}
          </TouchableOpacity>
          <Text className="text-[#9A9AA1] ml-2">Lembre-se de mim</Text>
        </View>

        {/* Botão Continue */}
        <TouchableOpacity
          className="bg-[#0A1F96] rounded-xl items-center justify-center p-3 mt-5"
          style={{
            shadowColor: "#0A1F96",
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
          onPress={logar}
        >
          <Text className="text-white font-semibold">Continue</Text>
        </TouchableOpacity>

        {/* Esqueceu a senha */}
        <View className="items-center justify-center mt-5">
          <Text className="text-[#9A9AA1]">Esqueceu sua senha?</Text>
          <TouchableOpacity>
            <Text className="text-[#61C0E2] font-medium">Clique aqui</Text>
          </TouchableOpacity>
        </View>

        {/* Termos e Privacidade */}
        <Text className="text-[#6B6B72] text-[11px] text-center absolute bottom-8 left-6 right-6">
          Ao continuar, você concorda com nossos
          <Text className="text-[#61C0E2]"> Termos de Serviço</Text>
          <Text> e </Text>
          <Text className="text-[#61C0E2]">Política de Privacidade</Text>
        </Text>
      </View>
    </View>
  );
}

export default LoginPage;