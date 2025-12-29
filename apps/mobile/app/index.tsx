import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-3xl font-bold text-gray-800 mb-2">校园宝</Text>
      <Text className="text-lg text-gray-600 mb-4">Campus Treasure</Text>
      <Text className="text-sm text-gray-500">校园二手交易平台</Text>
      <View className="mt-8 px-6 py-3 bg-primary-500 rounded-full">
        <Text className="text-white font-semibold">开始探索</Text>
      </View>
    </View>
  );
}
