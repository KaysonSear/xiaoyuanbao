import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib';
import { Category, Item, PaginatedResponse } from '@/types';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // 获取分类
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/categories'),
  });

  // 获取推荐物品
  const {
    data: itemsData,
    isLoading: isItemsLoading,
    refetch,
  } = useQuery({
    queryKey: ['items', 'home'],
    queryFn: () => api.get<Item[]>('/items'), // 这里后端返回的是 { data: [...] } 还是直接数组?
    // 后端 /items 返回的是 successResponse(items, meta) -> { success: true, data: items, meta: ... }
    // api.get 封装会自动返回 data 字段的内容，所以这里得到的应该是 Item[] (根据 api.ts 的实现)
    // 但是 /items 接口返回的是 PaginatedResponse 结构吗?
    // 后端代码: return successResponse(items, { page, ... });
    // api.ts: return json.data as T;
    // 所以 api.get<Item[]>('/items') 得到的是 Item[]。
    // 等等，后端 response structure 是 { success: true, data: [...], meta: ... }
    // api.ts 取的是 json.data。
    // 所以 api.get<Item[]>('/items') 会返回 items 数组。
    // 确认后端 /api/items 返回的 data 是 Item[] 还是 { items: Item[], ... }?
    // 后端: const [items, total] = ...; return successResponse(items, ...);
    // 所以 data 就是 Item[]。正确。
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

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
              {categories?.slice(0, 8).map((cat) => (
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
                itemsData.map((item) => (
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
