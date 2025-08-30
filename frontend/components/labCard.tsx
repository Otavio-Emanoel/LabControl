import { View, Text } from 'react-native'

export default function LabCard({labName}: {labName: string}) {
    return (<View className='flex w-[90%] h-full bg-blue-950 rounded-2xl mx-auto my-4 p-4'>
        {/* Cards de laboratórios */}
        <Text className='text-white font-bold text-2xl'>{labName}</Text>
    </View>)
}