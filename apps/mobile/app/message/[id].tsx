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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Message } from '@/types';
import { useAuthStore } from '@/store';

import { socketService } from '@/lib/socket';
import { useEffect } from 'react';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Other user ID
  const [content, setContent] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // Socket Connection & Listening
  useEffect(() => {
    if (user?.id) {
      socketService.connect();
      socketService.joinRoom(user.id);

      const socket = socketService.getSocket();

      const handleReceiveMessage = (newMessage: Message) => {
        // Only add if it belongs to this conversation (sender is me or sender is empty/other)
        // Actually, receive_message comes for ANY chat.
        // We must filter: is this message related to the current chat partner `id`?
        // Case 1: Partner sent it (senderId === id)
        // Case 2: I sent it (senderId === user.id) - if we listen to our own echoed messages

        if (newMessage.senderId === id || newMessage.senderId === user.id) {
          queryClient.setQueryData(['messages', id], (old: Message[] | undefined) => {
            if (!old) return [newMessage];
            // Avoid duplicates
            if (old.find((m) => m.id === newMessage.id)) return old;
            return [...old, newMessage];
          });
          // Scroll to bottom
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        }
      };

      socket?.on('receive_message', handleReceiveMessage);

      return () => {
        socket?.off('receive_message', handleReceiveMessage);
      };
    }
  }, [user?.id, id, queryClient]);

  // 获取消息记录 (Initial Load)
  const { data: messagesData } = useQuery({
    queryKey: ['messages', id],
    queryFn: async () => {
      const response = await api.get<{ messages: Message[] }>(`/messages?with=${id}`);
      return response.messages;
    },
    // Removed refetchInterval (Polling)
  });

  const handleSend = () => {
    if (!content.trim() || !user) return;

    // 1. Emit via Sockt
    const socket = socketService.getSocket();
    socket?.emit('send_message', {
      senderId: user.id,
      receiverId: id, // partner id
      content: content,
    });

    // 2. Optimistic Update (create a temp message)
    // Note: Since server.ts doesn't echo back to sender in current logic (I commented it out),
    // we MUST add it locally. Or uncomment it in server.ts.
    // For now, let's add locally.
    const tempMessage: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: id,
      content: content,
      type: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
      },
    };

    queryClient.setQueryData(['messages', id], (old: Message[] | undefined) => {
      return old ? [...old, tempMessage] : [tempMessage];
    });

    setContent('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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
