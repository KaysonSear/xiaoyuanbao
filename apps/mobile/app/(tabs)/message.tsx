import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '@/lib/api';
import { Conversation } from '@/types';
import { useAuthStore } from '@/store';

export default function MessageScreen() {
  const { isAuthenticated } = useAuthStore();

  const {
    data: conversations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<{ conversations: Conversation[] }>('/messages');
      return response.conversations;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-5xl mb-4">💬</Text>
        <Text className="text-xl text-gray-600 mb-6">登录后查看消息</Text>
        <TouchableOpacity
          className="bg-primary-500 px-8 py-3 rounded-full"
          onPress={() => router.push('/(auth)/login')}
        >
          <Text className="text-white font-semibold">去登录</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 bg-white border-b border-gray-50"
      onPress={() => router.push(`/message/${item.user.id}`)}
    >
      <View className="relative">
        <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center overflow-hidden">
          {item.user.avatar ? (
            <Image source={{ uri: item.user.avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-lg text-primary-500">{item.user.nickname[0]}</Text>
          )}
        </View>
        {item.unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center border border-white">
            <Text className="text-white text-[10px] font-bold">
              {item.unreadCount > 99 ? '99+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-base font-medium text-gray-900">{item.user.nickname}</Text>
          <Text className="text-xs text-gray-400">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <Text className="text-sm text-gray-500" numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-center">消息</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.user.id}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-4xl mb-4">📭</Text>
              <Text className="text-gray-400">暂无消息</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
