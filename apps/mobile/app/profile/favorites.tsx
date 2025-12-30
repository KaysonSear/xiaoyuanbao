import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib';
import { Item } from '@/types';

export default function MyFavoritesScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFavorites = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const data = await api.get<Item[]>('/items', { isFavorite: 'true' });
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRefresh = () => {
    fetchFavorites(true);
  };

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
          <View className="flex-row items-center mt-1">
            <Image
              source={{ uri: item.seller.avatar || 'https://via.placeholder.com/50' }}
              className="w-4 h-4 rounded-full mr-1"
            />
            <Text className="text-gray-500 text-xs">{item.seller.nickname}</Text>
          </View>
        </View>
        <Text className="text-red-500 font-bold text-lg">¥{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">我的收藏</Text>
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
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-gray-400">暂无收藏</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
