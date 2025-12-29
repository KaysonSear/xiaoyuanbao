import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuthStore } from '@/store';

// 模拟物品详情数据
const mockItem = {
  id: '1',
  title: '二手MacBook Pro 2021 M1芯片 16GB内存',
  description: `出售自用MacBook Pro 2021款
- M1 Pro芯片
- 16GB统一内存
- 512GB固态硬盘
- 14英寸Liquid Retina XDR显示屏
- 电池循环次数约200次
- 无磕碰，屏幕完美
- 配件齐全，有原装充电器

因换新出售，诚心出售，可小刀`,
  price: 6999,
  originalPrice: 14999,
  images: ['💻'],
  condition: '9成新',
  type: 'sale',
  views: 128,
  createdAt: '2025-12-28',
  seller: {
    id: 's1',
    nickname: '科技达人',
    avatar: '👤',
    creditScore: 95,
  },
  category: {
    name: '电子数码',
  },
  school: {
    name: '北京大学',
  },
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleContact = () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录', [
        { text: '取消' },
        { text: '去登录', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    Alert.alert('提示', '消息功能开发中');
  };

  const handleBuy = () => {
    if (!isAuthenticated) {
      Alert.alert('提示', '请先登录', [
        { text: '取消' },
        { text: '去登录', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }
    Alert.alert('提示', '购买功能开发中');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 顶部导航 */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">物品详情</Text>
        <TouchableOpacity onPress={() => setIsFavorite(!isFavorite)}>
          <Text className="text-2xl">{isFavorite ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* 图片区域 */}
        <View className="h-80 bg-gray-100 items-center justify-center">
          <Text className="text-8xl">{mockItem.images[0]}</Text>
        </View>

        {/* 价格和标题 */}
        <View className="px-4 py-4">
          <View className="flex-row items-baseline">
            <Text className="text-red-500 text-3xl font-bold">¥{mockItem.price}</Text>
            {mockItem.originalPrice && (
              <Text className="text-gray-400 line-through ml-2">¥{mockItem.originalPrice}</Text>
            )}
          </View>
          <Text className="text-lg text-gray-800 mt-2">{mockItem.title}</Text>
          <View className="flex-row mt-2 space-x-2">
            <Text className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs">
              {mockItem.condition}
            </Text>
            <Text className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs ml-2">
              {mockItem.category.name}
            </Text>
          </View>
        </View>

        {/* 卖家信息 */}
        <View className="bg-gray-50 mx-4 p-4 rounded-xl flex-row items-center">
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
            <Text className="text-2xl">{mockItem.seller.avatar}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="font-medium text-gray-800">{mockItem.seller.nickname}</Text>
            <Text className="text-gray-500 text-sm">信用分: {mockItem.seller.creditScore}</Text>
          </View>
          <Text className="text-gray-400 text-sm">{mockItem.school.name}</Text>
        </View>

        {/* 物品描述 */}
        <View className="px-4 py-4">
          <Text className="text-gray-800 font-medium mb-2">物品描述</Text>
          <Text className="text-gray-600 leading-6">{mockItem.description}</Text>
        </View>

        {/* 浏览量等信息 */}
        <View className="px-4 py-2 flex-row">
          <Text className="text-gray-400 text-sm">👁️ {mockItem.views}次浏览</Text>
          <Text className="text-gray-400 text-sm ml-4">📅 发布于{mockItem.createdAt}</Text>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex-row">
        <TouchableOpacity
          className="flex-1 items-center justify-center border border-primary-500 rounded-xl py-3 mr-2"
          onPress={handleContact}
        >
          <Text className="text-primary-500 font-medium">💬 联系卖家</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-primary-500 rounded-xl py-3 ml-2"
          onPress={handleBuy}
        >
          <Text className="text-white font-medium">立即购买</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
