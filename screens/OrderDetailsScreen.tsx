import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
  Tag,
  Calendar,
} from 'lucide-react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { OrderStorage } from '../hooks/order';
import { CartItem, Meal, MenuItem, Order } from '../types';
import { useFavorites } from '../hooks/favorite';
import { SessionStorage } from 'hooks/login';

type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

const OrderDetailsScreen: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<OrderDetailsRouteProp>();
  
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);


  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const orderData = await OrderStorage.findOrderById(orderId);
      
      if (!orderData) {
        Alert.alert('Error', 'Order not found');
        navigate.goBack();
        return;
      }
      
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order details:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      pending: {
        label: 'Order Placed',
        description: 'Your order has been received',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-300',
        icon: Clock,
        iconColor: '#F59E0B',
      },
      confirmed: {
        label: 'Order Confirmed',
        description: 'Restaurant is preparing your order',
        color: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: CheckCircle,
        iconColor: '#3B82F6',
      },
      preparing: {
        label: 'Preparing',
        description: 'Your delicious meal is being prepared',
        color: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: Package,
        iconColor: '#3B82F6',
      },
      out_for_delivery: {
        label: 'Out for Delivery',
        description: 'Driver is on the way to you',
        color: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        icon: Truck,
        iconColor: '#8B5CF6',
      },
      delivered: {
        label: 'Delivered',
        description: 'Order successfully delivered. Enjoy!',
        color: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: CheckCircle,
        iconColor: '#10B981',
      },
      cancelled: {
        label: 'Cancelled',
        description: 'This order was cancelled',
        color: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-300',
        icon: XCircle,
        iconColor: '#EF4444',
      },
    };

    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatEstimatedTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = () => {
    if (!order) return;

    if (order.status === 'delivered' || order.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This order cannot be cancelled');
      return;
    }

    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await OrderStorage.updateOrderStatus(order.id, 'cancelled');
              await loadOrderDetails();
              Alert.alert('Success', 'Order cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    Alert.alert(
      'Reorder',
      'Would you like to add these items to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            navigate.navigate('Dashboard');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Call support') },
        { text: 'Message', onPress: () => console.log('Message support') },
      ]
    );
  };


  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EF6820" />
          <Text className="mt-4 text-gray-600">Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 items-center justify-center px-8">
          <Package color="#D1D5DB" size={64} />
          <Text className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            Order Not Found
          </Text>
          <TouchableOpacity
            onPress={() => navigate.goBack()}
            className="bg-orange rounded-full px-8 py-4 mt-4"
          >
            <Text className="text-white font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const tax = 5.0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Order Details</Text>
            <Text className="text-sm text-gray-500">#{order.id.slice(-6)}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1">
        <View className="mx-4 mt-4 bg-white rounded-2xl p-4 border-2 ${statusInfo.borderColor}">
          <View className="flex-row items-center mb-3">
            <View className={`${statusInfo.color} rounded-full p-3 mr-3`}>
              <StatusIcon color={statusInfo.iconColor} size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900">
                {statusInfo.label}
              </Text>
              <Text className="text-sm text-gray-600">
                {statusInfo.description}
              </Text>
            </View>
          </View>

          {order.status !== 'cancelled' && (
            <View className="ml-3 pl-3 border-l-2 border-gray-200 mt-2">
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full ${
                  ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-orange'
                    : 'bg-gray-300'
                } -ml-4.5 mr-2`} />
                <Text className="text-sm text-gray-600">Order Placed</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full ${
                  ['confirmed', 'preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-orange'
                    : 'bg-gray-300'
                } -ml-4.5 mr-2`} />
                <Text className="text-sm text-gray-600">Confirmed</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full ${
                  ['preparing', 'out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-orange'
                    : 'bg-gray-300'
                } -ml-4.5 mr-2`} />
                <Text className="text-sm text-gray-600">Preparing</Text>
              </View>
              <View className="flex-row items-center mb-2">
                <View className={`w-3 h-3 rounded-full ${
                  ['out_for_delivery', 'delivered'].includes(order.status)
                    ? 'bg-orange'
                    : 'bg-gray-300'
                } -ml-4.5 mr-2`} />
                <Text className="text-sm text-gray-600">Out for Delivery</Text>
              </View>
              <View className="flex-row items-center">
                <View className={`w-3 h-3 rounded-full ${
                  order.status === 'delivered' ? 'bg-orange' : 'bg-gray-300'
                } -ml-4.5 mr-2`} />
                <Text className="text-sm text-gray-600">Delivered</Text>
              </View>
            </View>
          )}
        </View>

        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Calendar color="#6B7280" size={20} />
              <Text className="ml-2 text-gray-600 font-semibold">Order Date</Text>
            </View>
            <Text className="text-gray-900 font-semibold">
              {formatDate(order.orderDate)}
            </Text>
          </View>

          {order.estimatedDelivery && order.status !== 'delivered' && (
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
              <View className="flex-row items-center">
                <Clock color="#6B7280" size={20} />
                <Text className="ml-2 text-gray-600 font-semibold">Est. Delivery</Text>
              </View>
              <Text className="text-orange font-bold">
                {formatEstimatedTime(order.estimatedDelivery)}
              </Text>
            </View>
          )}
        </View>

        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Order Items ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <View
              key={item.productId}
              className={`flex-row items-center py-3 ${
                index !== order.items.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                className="w-16 h-16 rounded-xl"
              />
              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {item.name}
                </Text>
                {item.notes && (
                  <Text className="text-xs text-gray-500 mb-1">{item.notes}</Text>
                )}
                <Text className="text-sm text-gray-600">Qty: {item.quantity}</Text>
              </View>
              <Text className="text-base font-bold text-gray-900">
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row items-center mb-3">
            <MapPin color="#EF6820" size={20} />
            <Text className="ml-2 text-lg font-bold text-gray-900">
              Delivery Address
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {order.address.city}, {order.address.state}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {order.address.address}
            </Text>
            {order.address.complement && (
              <Text className="text-sm text-gray-600 mb-1">
                {order.address.complement}
              </Text>
            )}
            {order.address.reference && (
              <Text className="text-sm text-gray-500 italic">
                Ref: {order.address.reference}
              </Text>
            )}
            <Text className="text-sm text-gray-600 mt-1">
              ZIP: {order.address.zipCode}
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-4 bg-white rounded-2xl p-4">
          <View className="flex-row items-center mb-3">
            <CreditCard color="#EF6820" size={20} />
            <Text className="ml-2 text-lg font-bold text-gray-900">
              Payment Method
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-3">
            <Text className="text-base font-semibold text-gray-900 capitalize">
              {order.paymentMethod === 'card' ? 'Credit/Debit Card' : order.paymentMethod}
            </Text>
            {order.cardId && (
              <Text className="text-sm text-gray-600 mt-1">
                Card ending in ****
              </Text>
            )}
          </View>
        </View>

        <View className="mx-4 mt-4 mb-6 bg-white rounded-2xl p-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">
            Order Summary
          </Text>

          <View className="space-y-2">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900 font-semibold">
                ${order.subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900 font-semibold">
                ${order.deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Tax</Text>
              <Text className="text-gray-900 font-semibold">
                ${tax.toFixed(2)}
              </Text>
            </View>
            {order.discount && order.discount > 0 && (
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center">
                  <Tag color="#10B981" size={16} />
                  <Text className="text-green-600 font-semibold ml-1">
                    Discount {order.appliedCoupon && `(${order.appliedCoupon})`}
                  </Text>
                </View>
                <Text className="text-green-600 font-semibold">
                  -${order.discount.toFixed(2)}
                </Text>
              </View>
            )}
            <View className="border-t border-dashed border-gray-300 pt-3 flex-row justify-between">
              <Text className="text-lg font-bold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-orange">
                ${(order.total + tax).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white px-4 py-4 border-t border-gray-100">
        <View className="flex-row gap-3">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="flex-1 bg-gray-100 rounded-full py-4 items-center"
            >
              <Text className="text-gray-900 font-bold">Cancel Order</Text>
            </TouchableOpacity>
          )}

          {order.status === 'delivered' && (
            <TouchableOpacity
              onPress={handleReorder}
              className="flex-1 bg-orange rounded-full py-4 items-center"
            >
              <Text className="text-white font-bold">Reorder</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleContactSupport}
            className="flex-1 bg-orange rounded-full py-4 items-center flex-row justify-center"
          >
            <MessageCircle color="white" size={20} />
            <Text className="text-white font-bold ml-2">Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderDetailsScreen;