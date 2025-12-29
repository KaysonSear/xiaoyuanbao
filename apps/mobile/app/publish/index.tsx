import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store';

const conditions = ['全新', '9成新', '8成新', '7成新', '6成新以下'];
const categories = [
  { id: '1', name: '电子数码' },
  { id: '2', name: '图书教材' },
  { id: '3', name: '服饰鞋包' },
  { id: '4', name: '生活用品' },
  { id: '5', name: '运动户外' },
  { id: '6', name: '美妆护肤' },
  { id: '7', name: '租赁服务' },
  { id: '8', name: '其他' },
];

export default function PublishItemScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  // 未登录重定向
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 mb-4">请先登录</Text>
        <TouchableOpacity
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white">去登录</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!title || !description || !price || !condition || !categoryId) {
      Alert.alert('提示', '请填写完整信息');
      return;
    }

    if (title.length < 2 || title.length > 50) {
      Alert.alert('提示', '标题需要2-50个字符');
      return;
    }

    if (description.length < 10) {
      Alert.alert('提示', '描述至少10个字符');
      return;
    }

    setLoading(true);
    // 模拟提交
    setTimeout(() => {
      setLoading(false);
      Alert.alert('发布成功', '您的物品已发布', [{ text: '好的', onPress: () => router.back() }]);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部导航 */}
      <View className="bg-white flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">发布物品</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {/* 图片上传区域 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-3">物品图片</Text>
          <TouchableOpacity className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300">
            <Text className="text-3xl text-gray-400">+</Text>
            <Text className="text-gray-400 text-xs mt-1">添加图片</Text>
          </TouchableOpacity>
          <Text className="text-gray-400 text-xs mt-2">最多9张，第一张为封面</Text>
        </View>

        {/* 标题 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-2">标题</Text>
          <TextInput
            className="bg-gray-50 px-4 py-3 rounded-xl"
            placeholder="请输入物品标题（2-50字）"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
          />
        </View>

        {/* 描述 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-2">描述</Text>
          <TextInput
            className="bg-gray-50 px-4 py-3 rounded-xl h-32"
            placeholder="描述物品的品牌、型号、新旧程度等信息（至少10字）"
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
        </View>

        {/* 价格 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-2">价格</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-gray-500 text-xs mb-1">售价 *</Text>
              <TextInput
                className="bg-gray-50 px-4 py-3 rounded-xl"
                placeholder="¥0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-gray-500 text-xs mb-1">原价（选填）</Text>
              <TextInput
                className="bg-gray-50 px-4 py-3 rounded-xl"
                placeholder="¥0.00"
                value={originalPrice}
                onChangeText={setOriginalPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* 成色 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-3">成色</Text>
          <View className="flex-row flex-wrap">
            {conditions.map((c) => (
              <TouchableOpacity
                key={c}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  condition === c ? 'bg-primary-500' : 'bg-gray-100'
                }`}
                onPress={() => setCondition(c)}
              >
                <Text className={condition === c ? 'text-white' : 'text-gray-600'}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 分类 */}
        <View className="bg-white rounded-xl p-4 mb-4">
          <Text className="text-gray-800 font-medium mb-3">分类</Text>
          <View className="flex-row flex-wrap">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                  categoryId === cat.id ? 'bg-primary-500' : 'bg-gray-100'
                }`}
                onPress={() => setCategoryId(cat.id)}
              >
                <Text className={categoryId === cat.id ? 'text-white' : 'text-gray-600'}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* 底部提交按钮 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <TouchableOpacity
          className={`py-4 rounded-xl ${loading ? 'bg-primary-300' : 'bg-primary-500'}`}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">发布</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
