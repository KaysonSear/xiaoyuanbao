import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib';
import { Item } from '@/types';
import { useAuthStore } from '@/store';

export default function MyItemsScreen() {
  const user = useAuthStore((state) => state.user);

  const {
    data: items,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-items'],
    queryFn: () => api.get<Item[]>('/items', { params: { sellerId: user?.id || '' } }),
    enabled: !!user?.id,
  });

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-2 flex-row rounded-xl mx-4 mt-2"
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <View className="w-24 h-24 bg-gray-100 rounded-lg mr-3 overflow-hidden items-center justify-center">
        {item.images?.[0]?.startsWith('http') ? (
          <Image source={{ uri: item.images[0] }} className="w-full h-full" />
        ) : (
          <Text className="text-3xl">📦</Text>
        )}
      </View>
      <View className="flex-1 justify-between py-1">
        <View>
          <Text className="text-gray-800 font-medium text-base" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-1">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="flex-row justify-between items-end">
          <Text className="text-red-500 font-bold text-lg">¥{item.price}</Text>
          <Text
            className={`text-xs px-2 py-1 rounded ${
              item.status === 'available'
                ? 'bg-green-100 text-green-600'
                : item.status === 'sold'
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-red-100 text-red-500'
            }`}
          >
            {item.status === 'available' ? '在售' : item.status === 'sold' ? '已售出' : '已下架'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">我发布的</Text>
        <View className="w-5" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-400">暂无发布记录</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
