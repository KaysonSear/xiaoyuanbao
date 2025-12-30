import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib';
import { Order } from '@/types';

const PAYMENT_METHODS = [
  { id: 'alipay', name: '支付宝 (模拟)', icon: '🟦' },
  { id: 'wechat', name: '微信支付 (模拟)', icon: '🟩' },
  { id: 'wallet', name: '余额支付 (模拟)', icon: '💰' },
];

export default function OrderPayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedMethod, setSelectedMethod] = useState('alipay');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await api.get<Order>(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handlePay = async () => {
    if (!id) return;
    try {
      setIsPaying(true);
      // 模拟支付延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await api.post(`/orders/${id}/pay`, {});
      Alert.alert('支付成功', '订单已支付', [
        { text: '查看订单', onPress: () => router.replace(`/order/${id}`) },
      ]);
    } catch (error) {
      Alert.alert('支付失败', error instanceof Error ? error.message : '请稍后重试');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-500">加载订单信息...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">收银台</Text>
        <View className="w-5" />
      </View>

      {/* 订单金额 */}
      <View className="bg-white p-8 items-center justify-center mb-4">
        <Text className="text-gray-500 mb-2">支付金额</Text>
        <Text className="text-4xl font-bold text-gray-900">¥{order.amount.toFixed(2)}</Text>
        <Text className="text-gray-400 text-sm mt-2">订单号: {order.id.slice(-8)}</Text>
      </View>

      {/* 支付方式 */}
      <View className="bg-white px-4">
        <Text className="py-3 text-gray-500 text-sm">选择支付方式</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            className="flex-row items-center py-4 border-b border-gray-50"
            onPress={() => setSelectedMethod(method.id)}
          >
            <View className="w-8 h-8 items-center justify-center bg-gray-100 rounded mr-3">
              <Text className="text-xl">{method.icon}</Text>
            </View>
            <Text className="flex-1 text-base text-gray-800">{method.name}</Text>
            <View
              className={`w-5 h-5 rounded-full border items-center justify-center ${
                selectedMethod === method.id
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {selectedMethod === method.id && (
                <View className="w-2.5 h-2.5 rounded-full bg-white" />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 底部按钮 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
        <TouchableOpacity
          className={`py-4 rounded-xl ${isPaying ? 'bg-primary-300' : 'bg-primary-500'}`}
          onPress={handlePay}
          disabled={isPaying}
        >
          {isPaying ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">立即支付</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
