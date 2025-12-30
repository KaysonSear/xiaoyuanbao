import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/store';
import { api } from '@/lib';
import { User } from '@/types';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();

  const [nickname, setNickname] = useState(user?.nickname || '');
  const [school, setSchool] = useState(user?.school || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('需要权限', '请允许访问相册以更换头像');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset?.base64 && asset?.mimeType) {
        const base64Image = `data:${asset.mimeType};base64,${asset.base64}`;
        setAvatar(base64Image);
      }
    }
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await api.patch<User>('/users/me', {
        nickname,
        school,
        avatar: avatar.startsWith('data:') ? avatar : undefined, // Only send if changed (base64)
      });

      setUser(updatedUser);
      Alert.alert('成功', '个人信息已更新', [{ text: '确定', onPress: () => router.back() }]);
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('失败', error instanceof Error ? error.message : '更新失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-xl">取消</Text>
        </TouchableOpacity>
        <Text className="text-lg font-medium">编辑资料</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text className="text-primary-500 font-medium text-lg">保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* 头像 */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={handlePickImage} className="relative">
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center">
                <Text className="text-4xl">👤</Text>
              </View>
            )}
            <View className="absolute bottom-0 right-0 bg-primary-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-xs">📷</Text>
            </View>
          </TouchableOpacity>
          <Text className="text-gray-400 text-sm mt-2">点击更换头像</Text>
        </View>

        {/* 表单 */}
        <View className="bg-white rounded-xl overflow-hidden">
          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Text className="text-gray-600 w-16 font-medium">昵称</Text>
            <TextInput
              className="flex-1 text-gray-800 text-base"
              value={nickname}
              onChangeText={setNickname}
              placeholder="请输入昵称"
              maxLength={20}
            />
          </View>

          <View className="flex-row items-center px-4 py-4 border-b border-gray-100">
            <Text className="text-gray-600 w-16 font-medium">学校</Text>
            <TextInput
              className="flex-1 text-gray-800 text-base"
              value={school}
              onChangeText={setSchool}
              placeholder="请输入学校名称"
              maxLength={30}
            />
          </View>

          <View className="flex-row items-center px-4 py-4">
            <Text className="text-gray-600 w-16 font-medium">手机号</Text>
            <Text className="text-gray-400 text-base">
              {user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')} (不可修改)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
