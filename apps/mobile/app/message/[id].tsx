import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types';
import { useAuthStore } from '@/store';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Other user ID
  const [content, setContent] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // 获取消息记录
  const { data: messagesData } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await api.get<{ messages: Message[] }>(`/messages?with=${id}`);
      return response.messages;
    },
    refetchInterval: 5000, // 简单轮询
  });

  // 获取对方信息 (从第一条消息或单独获取)
  // 这里简化处理，假设对方信息已存在或通过其他方式获取
  // 实际应该有一个 get user by id API，或者从消息列表中提取

  // 发送消息 Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      await api.post('/messages', {
        receiverId: id,
        content: text,
      });
    },
    onSuccess: () => {
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSend = () => {
    if (!content.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(content);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;

    return (
      <View className={`flex-row mb-4 px-4 ${isMe ? 'flex-row-reverse' : ''}`}>
        <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
          {item.sender.avatar ? (
            <Image source={{ uri: item.sender.avatar }} className="w-full h-full" />
          ) : (
            <Text className="text-gray-500">{item.sender.nickname[0]}</Text>
          )}
        </View>
        <View
          className={`mx-2 p-3 rounded-2xl max-w-[70%] ${
            isMe ? 'bg-primary-500 rounded-tr-none' : 'bg-white rounded-tl-none'
          }`}
        >
          <Text className={`${isMe ? 'text-white' : 'text-gray-800'}`}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl text-gray-500 mr-4">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-medium flex-1">聊天</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messagesData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        inverted={false} // 我们的API是按时间正序返回的，所以不需要倒序，但需要滚动到底部
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 底部输入框 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-100 px-4 py-2">
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 min-h-[40px] max-h-[100px]"
              placeholder="发送消息..."
              multiline
              value={content}
              onChangeText={setContent}
            />
            <TouchableOpacity
              className={`ml-3 w-10 h-10 rounded-full items-center justify-center ${
                content.trim() ? 'bg-primary-500' : 'bg-gray-200'
              }`}
              onPress={handleSend}
              disabled={!content.trim()}
            >
              <Text className="text-white font-bold">↑</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
