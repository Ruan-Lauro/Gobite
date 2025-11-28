import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Clock, CheckCircle, Truck, X, Bell } from 'lucide-react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { BottomTabBar } from '../components/BottomTabBar';
import { SessionStorage } from '../hooks/login';
import { OrderStorage } from '../hooks/order';
import { NotificationService } from '../hooks/NotificationService';
import { Order } from '../types';

type FilterType = 'all' | 'pending' | 'completed';

const OrderScreen: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUserOrders();
      loadUnreadCount();
    }, [])
  );

  useEffect(() => {
    loadUserOrders();
    loadUnreadCount();
    
    const interval = setInterval(loadUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, activeFilter]);

  const loadUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadNotifications(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const session = await SessionStorage.getCurrentSession();

      if (!session?.user.id) {
        Alert.alert('Error', 'User not logged in');
        navigate.navigate('Login');
        return;
      }

      const userOrders = await OrderStorage.getUserOrders(session.user.id);
      setOrders(userOrders);
      console.log(`📦 Loaded ${userOrders.length} orders`);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (activeFilter === 'pending') {
      filtered = filtered.filter(
        (order) =>
          order.status === 'pending' ||
          order.status === 'confirmed' ||
          order.status === 'preparing' ||
          order.status === 'out_for_delivery'
      );
    } else if (activeFilter === 'completed') {
      filtered = filtered.filter(
        (order) =>
          order.status === 'delivered' || order.status === 'cancelled'
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) =>
        order.id.toLowerCase().includes(query) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(query)
        )
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      pending: { 
        label: 'Pending', 
        color: 'bg-yellow-100', 
        textColor: 'text-yellow-800', 
        icon: Clock,
        iconColor: '#F59E0B'
      },
      confirmed: { 
        label: 'Confirmed', 
        color: 'bg-blue-100', 
        textColor: 'text-blue-800', 
        icon: CheckCircle,
        iconColor: '#3B82F6'
      },
      preparing: { 
        label: 'Preparing', 
        color: 'bg-blue-100', 
        textColor: 'text-blue-800', 
        icon: Clock,
        iconColor: '#3B82F6'
      },
      out_for_delivery: { 
        label: 'On the way', 
        color: 'bg-purple-100', 
        textColor: 'text-purple-800', 
        icon: Truck,
        iconColor: '#8B5CF6'
      },
      delivered: { 
        label: 'Delivered', 
        color: 'bg-green-100', 
        textColor: 'text-green-800', 
        icon: CheckCircle,
        iconColor: '#10B981'
      },
      cancelled: { 
        label: 'Cancelled', 
        color: 'bg-red-100', 
        textColor: 'text-red-800', 
        icon: X,
        iconColor: '#EF4444'
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOrderPress = (order: Order) => {
    console.log('🔍 Navigating to order:', order.id);
    navigate.navigate('OrderDetails', { orderId: order.id });
  };

  const handleReorder = async (order: Order, event: any) => {
    event.stopPropagation();
    
    Alert.alert(
      'Reorder',
      'Would you like to add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            console.log('🔄 Reordering:', order.items);
            navigate.navigate('Dashboard');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF6820" />
          <Text className="mt-4 text-gray-600">Loading your orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="bg-white px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">My Orders</Text>
          

        </View>

        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Search color="#697586" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search orders..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-900 ml-3"
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#697586" size={20} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="bg-white px-4 py-3 border-b border-gray-100 flex-row gap-2">
        {(['all', 'pending', 'completed'] as FilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-full ${
              activeFilter === filter ? 'bg-orange' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                activeFilter === filter ? 'text-white' : 'text-gray-600'
              }`}
            >
              {filter === 'pending' 
                ? 'In Progress' 
                : filter === 'completed' 
                ? 'Completed' 
                : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length > 0 ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => handleOrderPress(order)}
                className="mx-4 my-3 bg-white rounded-2xl p-4 shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-gray-600 text-sm mb-1">
                      Order #{order.id.slice(-6)}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {formatDate(order.orderDate)}
                    </Text>
                  </View>
                  <View className={`${statusInfo.color} rounded-full px-3 py-1 flex-row items-center gap-1`}>
                    <StatusIcon color={statusInfo.iconColor} size={14} />
                    <Text className={`text-xs font-semibold ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-xl p-3 mb-3">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <View
                      key={`${item.productId}-${idx}`}
                      className={`flex-row items-center justify-between ${
                        idx !== 0 ? 'mt-2 pt-2 border-t border-gray-200' : ''
                      }`}
                    >
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold text-sm">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          Qty: {item.quantity}
                        </Text>
                      </View>
                      <Text className="text-gray-900 font-semibold text-sm ml-2">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {order.items.length > 2 && (
                    <Text className="text-gray-600 text-xs mt-2 pt-2 border-t border-gray-200">
                      +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                    </Text>
                  )}
                </View>

                <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                  <View>
                    <Text className="text-gray-600 text-xs">Total</Text>
                    <Text className="text-gray-900 font-bold text-lg">
                      ${order.total.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    {order.status === 'delivered' && (
                      <TouchableOpacity
                        onPress={(e) => handleReorder(order, e)}
                        className="bg-orange rounded-full px-4 py-2"
                      >
                        <Text className="text-white font-semibold text-sm">
                          Reorder
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleOrderPress(order)}
                      className="bg-gray-100 rounded-full px-4 py-2"
                    >
                      <Text className="text-gray-900 font-semibold text-sm">
                        Details
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Clock color="#D1D5DB" size={48} />
          <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            No orders yet
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            {searchQuery
              ? 'No orders found matching your search'
              : activeFilter === 'pending'
              ? 'You have no orders in progress'
              : activeFilter === 'completed'
              ? 'You have no completed orders'
              : 'Start your first order now!'}
          </Text>
          <TouchableOpacity
            onPress={() => navigate.navigate('Dashboard')}
            className="bg-orange rounded-full px-8 py-4"
          >
            <Text className="text-white font-bold">Start Ordering</Text>
          </TouchableOpacity>
        </View>
      )}

      <BottomTabBar activeTab="Order" />
    </SafeAreaView>
  );
};

export default OrderScreen;