import { View, Text } from 'react-native'

export default function LabCard({labName}: {labName: string}) {
    return (<View className='flex w-[90%] h-20 bg-[#01071d] rounded-2xl mx-auto my-4 p-4'>
        {/* Cards de laboratórios */}
        <Text className='text-white font-bold text-xl'>{labName.charAt(0).toUpperCase() + labName.slice(1)}</Text>
    </View>)
}