import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '@/lib';
import { Category, Item } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

// 轮播图数据
const bannerData = [
  {
    id: '1',
    image: 'https://picsum.photos/seed/banner1/800/300',
    title: '📚 开学季教材大促',
    subtitle: '二手教材低至2折起',
    color: '#FF6B6B',
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/banner2/800/300',
    title: '📱 数码好物专场',
    subtitle: '手机平板超值价',
    color: '#4ECDC4',
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/banner3/800/300',
    title: '🎒 校园生活必备',
    subtitle: '宿舍神器一站购',
    color: '#45B7D1',
  },
];

// 快捷入口
const quickLinks = [
  { id: '1', icon: '🔥', title: '今日热卖', color: '#FF6B6B', filter: 'hot' },
  { id: '2', icon: '⚡', title: '闪电发布', color: '#FFD93D', filter: 'new' },
  { id: '3', icon: '💰', title: '超值捡漏', color: '#6BCB77', filter: 'cheap' },
  { id: '4', icon: '🎁', title: '免费送', color: '#9B59B6', filter: 'free' },
];

// 默认分类数据
const defaultCategories: Category[] = [
  { id: '1', name: '电子数码', icon: '📱' },
  { id: '2', name: '服饰鞋包', icon: '👔' },
  { id: '3', name: '书籍教材', icon: '📚' },
  { id: '4', name: '生活用品', icon: '🏠' },
  { id: '5', name: '运动户外', icon: '⚽' },
  { id: '6', name: '美妆护肤', icon: '💄' },
  { id: '7', name: '其他', icon: '📦' },
  { id: '8', name: '全部分类', icon: '🔍' },
];

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [itemsData, setItemsData] = useState<Item[]>([]);
  const [isCatsLoading, setIsCatsLoading] = useState(false);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerData.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setIsCatsLoading(true);
      const data = await api.get<Category[]>('/categories');
      if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsCatsLoading(false);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    console.log('[HomeScreen] fetchItems called');
    try {
      setIsItemsLoading(true);
      const response = await api.get<{ items: Item[] }>('/items');
      console.log('[HomeScreen] fetchItems response:', response?.items?.length, 'items');
      setItemsData(response?.items || []);
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch items:', error);
      setItemsData([]);
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

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: '/search/result',
      params: { category: category.name, q: '' },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
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

        {/* 轮播图 Banner */}
        <View className="bg-white px-4 py-3">
          <View className="rounded-2xl overflow-hidden" style={{ height: 140 }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (screenWidth - 32));
                setCurrentBanner(index);
              }}
            >
              {bannerData.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  activeOpacity={0.9}
                  style={{ width: screenWidth - 32 }}
                  className="relative"
                >
                  <Image
                    source={{ uri: banner.image }}
                    className="w-full h-full absolute"
                    resizeMode="cover"
                  />
                  <View
                    className="absolute inset-0 px-4 justify-center"
                    style={{ backgroundColor: banner.color + '99' }}
                  >
                    <Text className="text-white text-xl font-bold mb-1">{banner.title}</Text>
                    <Text className="text-white/90 text-sm">{banner.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* 轮播指示器 */}
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center">
              {bannerData.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === currentBanner ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </View>
          </View>
        </View>

        {/* 快捷入口 */}
        <View className="bg-white mt-2 px-4 py-3">
          <View className="flex-row justify-between">
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.id}
                className="items-center"
                onPress={() => {
                  // 根据筛选类型跳转到不同页面
                  if (link.filter === 'new') {
                    router.push('/publish');
                  } else {
                    router.push({
                      pathname: '/search/result',
                      params: { q: link.title },
                    });
                  }
                }}
              >
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                  style={{ backgroundColor: link.color + '20' }}
                >
                  <Text className="text-2xl">{link.icon}</Text>
                </View>
                <Text className="text-gray-700 text-xs font-medium">{link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 分类网格 */}
        <View className="bg-white mt-2 px-4 py-4">
          <Text className="text-base font-bold text-gray-800 mb-3">分类浏览</Text>
          {isCatsLoading ? (
            <ActivityIndicator />
          ) : (
            <View className="flex-row flex-wrap">
              {categories?.slice(0, 8).map((cat: Category) => (
                <TouchableOpacity
                  key={cat.id}
                  className="w-1/4 items-center py-3"
                  onPress={() => handleCategoryPress(cat)}
                >
                  <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mb-2">
                    <Text className="text-2xl">{cat.icon || cat.name[0]}</Text>
                  </View>
                  <Text className="text-gray-700 text-xs">{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 今日精选 */}
        <View className="bg-white mt-2 px-4 py-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-gray-800">今日精选</Text>
              <Text className="ml-2 text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                HOT
              </Text>
            </View>
            <TouchableOpacity>
              <Text className="text-gray-400 text-sm">查看更多 &gt;</Text>
            </TouchableOpacity>
          </View>

          {isItemsLoading ? (
            <ActivityIndicator size="large" className="py-10" />
          ) : (
            <View className="flex-row flex-wrap -mx-1">
              {itemsData.map((item: Item) => (
                <TouchableOpacity
                  key={item.id}
                  className="w-1/2 p-1.5"
                  onPress={() => router.push(`/item/${item.id}`)}
                >
                  <View className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                    <View className="h-36 bg-gray-100 overflow-hidden">
                      {item.images[0] ? (
                        item.images[0].startsWith('http') ||
                        item.images[0].startsWith('data:image') ? (
                          <Image
                            source={{ uri: item.images[0] }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center bg-gray-200">
                            <Text className="text-5xl">{item.images[0]}</Text>
                          </View>
                        )
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Text className="text-gray-300">无图</Text>
                        </View>
                      )}
                    </View>
                    <View className="p-3">
                      <Text
                        className="text-gray-800 font-medium text-sm leading-5"
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-red-500 font-bold text-lg">
                          ¥<Text className="text-xl">{item.price}</Text>
                        </Text>
                        <Text className="text-gray-400 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.condition}
                        </Text>
                      </View>
                      <View className="flex-row items-center mt-2">
                        <View className="w-5 h-5 rounded-full bg-blue-100 items-center justify-center mr-1.5">
                          <Text className="text-[10px] text-blue-500">
                            {item.seller?.nickname?.[0] || '?'}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-xs flex-1" numberOfLines={1}>
                          {item.seller?.nickname || '匿名用户'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 底部安全区 */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
