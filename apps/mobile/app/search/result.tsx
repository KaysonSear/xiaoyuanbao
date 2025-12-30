import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '@/lib/api';
import { Item } from '@/types';

export default function SearchResultScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string }>();
  const [keyword, setKeyword] = useState(params.q || '');
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSearchResults = useCallback(async () => {
    if (!params.q && !params.category) return;
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q);
      if (params.category) queryParams.append('category', params.category);

      const response = await api.get<{ items: Item[] }>(`/items/search?${queryParams.toString()}`);
      setItems(response.items);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      setIsLoading(false);
    }
  }, [params.q, params.category]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    router.setParams({ q: keyword });
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      className="flex-row bg-white p-3 mb-3 rounded-xl mx-4 shadow-sm"
      onPress={() => router.push(`/item/${item.id}` as never)}
    >
      <Image
        source={{ uri: item.images[0] }}
        className="w-24 h-24 rounded-lg bg-gray-100"
        resizeMode="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-gray-900 font-medium text-lg leading-6" numberOfLines={2}>
            {item.title}
          </Text>
          <Text className="text-gray-500 text-xs mt-1 bg-gray-100 self-start px-2 py-0.5 rounded">
            {item.condition}
          </Text>
        </View>
        <View className="flex-row items-end justify-between">
          <Text className="text-red-500 font-bold text-lg">¥{item.price}</Text>
          <View className="flex-row items-center">
            <Image
              source={{ uri: item.seller.avatar }}
              className="w-5 h-5 rounded-full mr-1.5 bg-gray-200"
            />
            <Text className="text-gray-500 text-xs">{item.seller.nickname}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部搜索栏 */}
      <View className="bg-white px-4 py-2 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-2xl text-gray-500">←</Text>
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 h-10">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-base text-gray-800 h-full"
            placeholder="搜索宝贝"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={handleSearch} className="ml-3">
          <Text className="text-primary-500 font-medium">搜索</Text>
        </TouchableOpacity>
      </View>

      {/* 结果列表 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Text className="text-4xl mb-2">😶‍🌫️</Text>
              <Text className="text-gray-500">没有找到相关物品</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
