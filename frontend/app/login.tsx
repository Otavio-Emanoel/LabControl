import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { api, getApiBaseUrl } from "@/lib/api";
import ConnectionBadge from "@/components/ConnectionBadge";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [hidePassword, setHidePassword] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const logar = async () => {
    const base = getApiBaseUrl();
    if (!base) {
      setErrorMsg("API_URL não configurada. Defina em .env e reinicie o app.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const response = await api.post(`/auth/login`, {
        email,
        senha: password,
      });

      const { token, user } = response.data || {};
      if (!token) {
        throw new Error("Token não recebido do servidor.");
      }

      await AsyncStorage.setItem("auth_token", token);
      if (user) {
        await AsyncStorage.setItem("auth_user", JSON.stringify(user));
      }
      router.replace("/");
    } catch (error: any) {
      console.error("Login error:", error);
      const msg = error?.response?.data?.error
        || (error?.message === "Network Error" ? `Falha de rede. Verifique se o servidor (${base}) está acessível.` : error?.message)
        || "Erro ao fazer login.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <View className="flex-1 bg-[#0B0B0F]">
        <StatusBar style="light" />
        {/* Eclipses decorativos (posicionamento mais fiel ao mock) */}
        {Platform.OS !== 'web' && (
          <>
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
          </>
        )}

        {/* Conteúdo */}
        <View className={Platform.OS === 'web' ? "flex-1 items-center justify-center px-6 py-12" : "flex-1 justify-center px-6 pt-6 pb-20"}>
          <View className={Platform.OS === 'web' ? "w-full max-w-[480px] mx-auto" : ""}>
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

            {/* Erro */}
            {errorMsg ? (
              <Text className="text-red-400 mt-3 ml-1">{errorMsg}</Text>
            ) : null}

            {/* Botão Continue */}
            <TouchableOpacity
              className="bg-[#0A1F96] rounded-xl items-center justify-center p-3 mt-5"
              style={{
                shadowColor: "#0A1F96",
                shadowOpacity: 0.35,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
                opacity: loading ? 0.7 : 1,
              }}
              onPress={logar}
              disabled={loading}
            >
              <Text className="text-white font-semibold">{loading ? "Entrando..." : "Continue"}</Text>
            </TouchableOpacity>

            {/* Termos e Privacidade */}
            {Platform.OS === 'web' ? (
              <Text className="text-[#6B6B72] text-[11px] text-center mt-6">
                Este aplicativo foi desenvolvido para fins educacionais. Ao continuar, você concorda com nossos

                <Text className="text-[#61C0E2]"> Termos de Serviço</Text>
              </Text>
            ) : (
              <Text className="text-[#6B6B72] text-[11px] text-center mt-5">
                Este aplicativo foi desenvolvido para fins educacionais. Ao continuar, você concorda com nossos
                <Text className="text-[#61C0E2]"> Termos de Serviço</Text>
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={{ position: 'absolute', top: 12, right: 12 }}>
        <ConnectionBadge />
      </View>
    </SafeAreaView>
  );
}

export default LoginPage;