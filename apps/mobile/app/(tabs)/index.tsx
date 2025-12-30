import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/lib';
import { Category, Item } from '@/types';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [isCatsLoading, setIsCatsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsCatsLoading(true);
      const data = await api.get<Category[]>('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsCatsLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      setIsItemsLoading(true);
      const data = await api.get<Item[]>('/items');
      setItemsData(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [fetchCategories, fetchItems]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchItems()]);
    setRefreshing(false);
  }, [fetchCategories, fetchItems]);

  const isLoading = isCatsLoading || isItemsLoading;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 顶部搜索栏 */}
        <View className="bg-white px-4 py-3">
          <TouchableOpacity
            className="bg-gray-100 rounded-full px-4 py-3 flex-row items-center"
            onPress={() => router.push('/(tabs)/search')}
          >
            <Text className="text-gray-400 flex-1">搜索你想要的宝贝</Text>
            <Text>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* 分类网格 */}
        <View className="bg-white mt-2 px-4 py-4">
          {isCatsLoading ? (
            <ActivityIndicator />
          ) : (
            <View className="flex-row flex-wrap">
              {categories?.slice(0, 8).map((cat: Category) => (
                <TouchableOpacity key={cat.id} className="w-1/4 items-center py-3">
                  <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-1">
                    {/* 这里如果有 icon url 可以用 Image，暂时用首字代替 */}
                    {cat.icon ? (
                      <Text className="text-2xl">{cat.icon}</Text>
                    ) : (
                      <Text className="text-xl text-primary-500">{cat.name[0]}</Text>
                    )}
                  </View>
                  <Text className="text-gray-700 text-xs">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 推荐物品 */}
        <View className="mt-2 px-4">
          <Text className="text-lg font-bold text-gray-800 py-3">推荐好物</Text>
          {isLoading ? (
            <ActivityIndicator size="large" className="py-10" />
          ) : (
            <View className="flex-row flex-wrap -mx-1">
              {itemsData && itemsData.length > 0 ? (
                itemsData.map((item: Item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="w-1/2 p-1"
                    onPress={() => router.push(`/item/${item.id}`)}
                  >
                    <View className="bg-white rounded-xl p-3 shadow-sm">
                      <View className="h-32 bg-gray-100 rounded-lg items-center justify-center mb-2 overflow-hidden">
                        {item.images[0] ? (
                          // 实际项目中应使用 Image 组件 loading 网络图片
                          // 既然后端 mock 数据存的是 emoji 字符串或者url
                          // 这里简单判断一下
                          item.images[0].startsWith('http') ? (
                            <Image
                              source={{ uri: item.images[0] }}
                              className="w-full h-full"
                              resizeMode="cover"
                            />
                          ) : (
                            <Text className="text-5xl">{item.images[0]}</Text>
                          )
                        ) : (
                          <Text className="text-gray-300">无图</Text>
                        )}
                      </View>
                      <Text
                        className="text-gray-800 font-medium text-sm h-10 leading-5"
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-red-500 font-bold text-base">¥{item.price}</Text>
                        <Text className="text-gray-400 text-[10px] bg-gray-100 px-1 rounded">
                          {item.condition}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-1">
                        <View className="w-4 h-4 rounded-full bg-gray-200 items-center justify-center mr-1">
                          <Text className="text-[8px]">{item.seller.nickname[0]}</Text>
                        </View>
                        <Text className="text-gray-400 text-xs truncate" numberOfLines={1}>
                          {item.seller.nickname}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="w-full py-10 items-center">
                  <Text className="text-gray-400">暂无推荐物品</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
