import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib';
import { Order } from '@/types';
import { useAuthStore } from '@/store';

const STATUS_MAP: Record<string, string> = {
  pending: '待支付',
  paid: '待发货',
  shipping: '待收货',
  completed: '已完成',
  cancelled: '已取消',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const updateStatus = async (action: string) => {
    if (!id) return;
    try {
      setIsUpdating(true);
      await api.patch<Order>(`/orders/${id}`, { action });
      await fetchOrder(); // Refetch order data
      Alert.alert('操作成功');
    } catch (err) {
      Alert.alert('操作失败', err instanceof Error ? err.message : '请稍后重试');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text>加载中...</Text>
      </SafeAreaView>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.item.seller.id;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-medium">订单详情</Text>
        <View className="w-5" />
      </View>

      <View className="p-4 bg-primary-500">
        <Text className="text-white text-lg font-bold">{STATUS_MAP[order.status]}</Text>
        <Text className="text-white text-sm opacity-80 mt-1">ID: {order.id.slice(-8)}</Text>
      </View>

      <View className="bg-white mt-2 p-4">
        <Text className="text-gray-800 font-medium mb-2">订单信息</Text>
        <View className="flex-row">
          <Text className="text-gray-500 w-20">买家</Text>
          <Text className="text-gray-800 flex-1">{order.buyer.nickname}</Text>
        </View>
        <View className="flex-row mt-2">
          <Text className="text-gray-500 w-20">下单时间</Text>
          <Text className="text-gray-800 flex-1">{new Date(order.createdAt).toLocaleString()}</Text>
        </View>
      </View>

      <View className="bg-white mt-2 p-4 flex-row">
        <View className="w-16 h-16 bg-gray-100 rounded mr-3 overflow-hidden items-center justify-center">
          {/* 这里实际应显示图片，简化兼容处理 */}
          <Text className="text-2xl">📦</Text>
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-gray-800 font-medium">{order.item.title}</Text>
          <Text className="text-red-500 mt-1">¥{order.amount}</Text>
        </View>
      </View>

      {/* 操作按钮 */}
      <View className="mt-6 px-4">
        {order.status === 'pending' && isBuyer && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => router.push({ pathname: '/order/pay', params: { id: order.id } })}
          >
            <Text className="text-white text-center font-bold">去支付</Text>
          </TouchableOpacity>
        )}

        {order.status === 'paid' && isSeller && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => updateStatus('ship')}
            disabled={isUpdating}
          >
            <Text className="text-white text-center font-bold">
              {isUpdating ? '处理中...' : '确认发货'}
            </Text>
          </TouchableOpacity>
        )}

        {order.status === 'shipping' && isBuyer && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-full mb-3"
            onPress={() => updateStatus('confirm')}
            disabled={isUpdating}
          >
            <Text className="text-white text-center font-bold">
              {isUpdating ? '处理中...' : '确认收货'}
            </Text>
          </TouchableOpacity>
        )}

        {(order.status === 'pending' || (order.status === 'paid' && isSeller)) && (
          <TouchableOpacity
            className="bg-white border border-gray-300 py-3 rounded-full"
            onPress={() => updateStatus('cancel')}
            disabled={isUpdating}
          >
            <Text className="text-gray-600 text-center">
              {isUpdating ? '处理中...' : '取消订单'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
