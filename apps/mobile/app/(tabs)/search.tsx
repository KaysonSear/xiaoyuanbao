import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const CATEGORIES = [
  { id: '1', name: '电子数码', icon: '📱' },
  { id: '2', name: '服饰鞋包', icon: '👔' },
  { id: '3', name: '书籍教材', icon: '📚' },
  { id: '4', name: '生活用品', icon: '🏠' },
  { id: '5', name: '运动户外', icon: '⚽' },
  { id: '6', name: '美妆护肤', icon: '💄' },
  { id: '7', name: '其他', icon: '📦' },
];

const HOT_SEARCHES = ['iPhone', '自行车', '考研资料', '电风扇', '吉他'];

export default function SearchScreen() {
  const [keyword, setKeyword] = useState('');

  const handleSearch = (text: string) => {
    if (!text.trim()) return;
    router.push({
      pathname: '/search/result',
      params: { q: text },
    });
  };

  const handleCategoryPress = (categoryName: string) => {
    router.push({
      pathname: '/search/result',
      params: { category: categoryName },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 搜索栏 */}
      <View className="px-4 py-2 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 h-10">
          <Text className="text-gray-400 text-lg mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-base text-gray-800 h-full"
            placeholder="搜索宝贝"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => handleSearch(keyword)}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* 热门搜索 */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">热门搜索</Text>
          <View className="flex-row flex-wrap">
            {HOT_SEARCHES.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-100 px-4 py-2 rounded-full mr-3 mb-3"
                onPress={() => handleSearch(item)}
              >
                <Text className="text-gray-600">{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 分类浏览 */}
        <View className="mt-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">全部分类</Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="w-[23%] items-center mb-6"
                onPress={() => handleCategoryPress(item.name)}
              >
                <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center mb-2">
                  <Text className="text-3xl">{item.icon}</Text>
                </View>
                <Text className="text-xs text-gray-600 font-medium">{item.name}</Text>
              </TouchableOpacity>
            ))}
            {/* 补位元素，保持左对齐 */}
            <View className="w-[23%]" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
