import { View, Text, TextInput, TouchableOpacity } from "react-native"

function LoginPage() {
    return (
        <View className="flex-1 items-center justify-center bg-[#fff]">
            <View className="w-full p-14">
                <View className="bg-primary h-12 w-12 rounded"></View>
                <Text className="font-bold text-xl">Bem vindo</Text>
                <Text>Faça login para ter acesso à sua conta</Text>
                <View className="flex-1 flex-row">
                    <View className="h-2 w-[70%] mt-5 bg-primary rounded"></View>
                    <View className="h-2 w-[30%] mt-5 bg-[#F0F2F9] rounded"></View>
                </View>
                <Text className="text-[#626262] text-xl ml-2 mt-3">Email</Text>
                <TextInput className="bg-[#F0F2F9] h-12 rounded-xl pl-16 p-4 text-[#828282]"
                    placeholder="Insira seu email">

                </TextInput>

                <Text className="text-[#626262] text-xl ml-2 mt-3">Senha</Text>
                <TextInput className="bg-[#F0F2F9] h-12 rounded-xl pl-16 p-4 text-[#828282]"
                    placeholder="Insira sua senha">

                </TextInput>

                <TouchableOpacity className="bg-[#070E98] rounded-xl text-center items-center shadow-xl p-3 mt-5">
                    <Text className="text-white">Continue</Text>
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center mt-4">
                    <Text className="text-[#828282] ">Esqueceu sua senha?</Text>
                    <Text className="text-[#61C0E2]">Clique aqui</Text></View>

                    <Text className=" text-[#828282] flex-1 text-center absolute bottom-0 justify-center items-center w-full left-0 ">By clicking continue, you agree to our Terms of Service and Privacy Policy</Text>

            </View>
        </View>
    )
}
export default LoginPage