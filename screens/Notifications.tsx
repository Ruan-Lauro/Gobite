import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Tag, Package, Truck, Info, Trash2 } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { NotificationService, AppNotification } from '../hooks/NotificationService';
import { BottomTabBar } from '../components/BottomTabBar';

const Notifications: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getAllNotifications();
      setNotifications(data);
      
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
      await loadNotifications();
    }

    if (notification.type === 'coupon') {
    } else if (notification.orderId) {
      navigate.navigate('Order');
    }
  };

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    await loadNotifications();
  };

  const handleDelete = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.deleteNotification(notificationId);
            await loadNotifications();
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await NotificationService.clearAllNotifications();
            await loadNotifications();
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'coupon':
        return Tag;
      case 'order_ready':
        return Package;
      case 'delivery':
        return Truck;
      default:
        return Info;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF6820" />
          <Text className="mt-4 text-gray-600">Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
              <ChevronLeft color="#000" size={24} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
          </View>
          
          {unreadCount > 0 && (
            <View className="bg-orange rounded-full px-3 py-1">
              <Text className="text-white font-bold text-xs">{unreadCount}</Text>
            </View>
          )}
        </View>

        {notifications.length > 0 && (
          <View className="flex-row gap-2 mt-2">
            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={handleMarkAllRead}
                className="bg-gray-100 rounded-full px-4 py-2"
              >
                <Text className="text-gray-700 font-semibold text-sm">
                  Mark all read
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleClearAll}
              className="bg-gray-100 rounded-full px-4 py-2"
            >
              <Text className="text-gray-700 font-semibold text-sm">
                Clear all
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {notifications.length > 0 ? (
        <ScrollView className="flex-1">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            
            return (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`mx-4 my-2 bg-white rounded-2xl p-4 ${
                  !notification.read ? 'border-2 border-orange' : ''
                }`}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                      notification.type === 'coupon'
                        ? 'bg-green-100'
                        : notification.type === 'order_ready'
                        ? 'bg-blue-100'
                        : notification.type === 'delivery'
                        ? 'bg-purple-100'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Icon
                      color={
                        notification.type === 'coupon'
                          ? '#10B981'
                          : notification.type === 'order_ready'
                          ? '#3B82F6'
                          : notification.type === 'delivery'
                          ? '#8B5CF6'
                          : '#6B7280'
                      }
                      size={24}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-start justify-between mb-1">
                      <Text className="text-base font-bold text-gray-900 flex-1 pr-2">
                        {notification.title}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>

                    <Text className="text-sm text-gray-600 mb-2">
                      {notification.body}
                    </Text>

                    {notification.coupon && (
                      <View className="bg-orange-50 rounded-xl p-3 mt-2 border border-orange-200">
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="bg-orange rounded-full px-3 py-1">
                            <Text className="text-white font-bold text-lg">
                              {notification.coupon.discount}% OFF
                            </Text>
                          </View>
                          <View className="bg-white rounded-lg px-3 py-1 border border-dashed border-orange">
                            <Text className="text-orange font-mono font-bold">
                              {notification.coupon.code}
                            </Text>
                          </View>
                        </View>
                        <Text className="text-gray-700 text-sm mb-1">
                          {notification.coupon.description}
                        </Text>
                        {notification.coupon.minOrderValue && notification.coupon.minOrderValue > 0 && (
                          <Text className="text-gray-600 text-xs">
                            Min. order: ${notification.coupon.minOrderValue}
                          </Text>
                        )}
                        <Text className="text-gray-500 text-xs mt-1">
                          Expires: {new Date(notification.coupon.expiryDate).toLocaleDateString()}
                        </Text>
                      </View>
                    )}

                    {!notification.read && (
                      <View className="mt-2">
                        <View className="w-2 h-2 rounded-full bg-orange" />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(notification.id)}
                    className="ml-2 p-2"
                  >
                    <Trash2 color="#EF4444" size={18} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Bell color="#D1D5DB" size={64} />
          <Text className="text-2xl font-bold text-gray-900 mt-6 mb-2">
            No notifications yet
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            We'll notify you when something important happens
          </Text>
          <TouchableOpacity
            onPress={() => navigate.navigate('Dashboard')}
            className="bg-orange rounded-full px-8 py-4"
          >
            <Text className="text-white font-bold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomTabBar activeTab="Order" />
    </SafeAreaView>
  );
};

export default Notifications;