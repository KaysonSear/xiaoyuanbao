import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '@/store';

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-4">👤</Text>
          <Text className="text-xl text-gray-600 mb-2">未登录</Text>
          <Text className="text-gray-400 text-center mb-8">登录后查看个人信息</Text>
          <TouchableOpacity
            className="bg-primary-500 px-8 py-3 rounded-full"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-white font-semibold">去登录</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: '📦', title: '我发布的', desc: '查看我发布的物品', path: '/profile/my-items' },
    { icon: '❤️', title: '我的收藏', desc: '收藏的物品', path: '/profile/favorites' },
    { icon: '🛒', title: '我买到的', desc: '我购买的订单', path: '/order/list?type=buy' },
    { icon: '💰', title: '我卖出的', desc: '我售出的订单', path: '/order/list?type=sell' },
    { icon: '💬', title: '我的消息', desc: '聊天记录', path: '/message' },
    { icon: '✏️', title: '编辑资料', desc: '修改个人信息', path: '/profile/edit' },
    { icon: '⚙️', title: '设置', desc: '账号与安全', path: '/settings' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 用户信息卡片 */}
        <View className="bg-white px-4 py-6">
          <View className="flex-row items-center">
            {/* 头像 */}
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-16 h-16 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-3xl">👤</Text>
              </View>
            )}
            {/* 用户信息 */}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">{user?.nickname}</Text>
              <Text className="text-gray-500 mt-1">
                {user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
              </Text>
              {user?.school && (
                <Text className="text-primary-500 text-sm mt-1">🏫 {user.school}</Text>
              )}
            </View>
            {/* 编辑按钮 */}
            <TouchableOpacity
              className="px-4 py-2 border border-gray-200 rounded-full"
              onPress={() => router.push('/profile/edit' as never)}
            >
              <Text className="text-gray-600 text-sm">编辑</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 统计信息 */}
        <View className="bg-white mt-2 flex-row py-4">
          {[
            { label: '发布', value: 0 },
            { label: '已售', value: 0 },
            { label: '已买', value: 0 },
          ].map((stat, index) => (
            <View key={index} className="flex-1 items-center">
              <Text className="text-xl font-bold text-gray-800">{stat.value}</Text>
              <Text className="text-gray-500 text-sm mt-1">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* 菜单项 */}
        <View className="bg-white mt-2">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => item.path && router.push(item.path as never)}
            >
              <Text className="text-2xl mr-4">{item.icon}</Text>
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">{item.title}</Text>
                <Text className="text-gray-400 text-sm">{item.desc}</Text>
              </View>
              <Text className="text-gray-300 text-xl">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出登录 */}
        <TouchableOpacity className="bg-white mt-4 py-4" onPress={handleLogout}>
          <Text className="text-red-500 text-center font-medium">退出登录</Text>
        </TouchableOpacity>

        {/* 底部空间 */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
