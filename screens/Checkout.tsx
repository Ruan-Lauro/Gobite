import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, ChevronRight, Tag } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { CartStorage } from '../hooks/cart';
import { UserStorage } from '../hooks/user';
import { OrderStorage } from '../hooks/order';
import { CouponService } from '../hooks/CouponService';
import { OrderTrackingService } from '../hooks/OrderTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, SavedCard, Location, User, Order } from 'types';
import { SessionStorage } from 'hooks/login';
import { BottomTabBar } from 'components/BottomTabBar';

const Checkout: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [cart, setCart] = useState<Cart | null>(null);
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [voucherCode, setVoucherCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationUser, setLocationUser] = useState<Location>();
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const session = await SessionStorage.getCurrentSession();  
      const allUsers = await UserStorage.getAllUsers();
      const currentUser = allUsers.find(u => u.id === session?.user.id);
     
      if (currentUser) {
        setCurrentUser(currentUser);
        setLocationUser(currentUser.chooseLocation);
      }
      
      const cartData = await CartStorage.getCart();
      setCart(cartData);

      if(currentUser?.chooseCard){
        setSelectedCard(currentUser.chooseCard);
      }
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Error', 'Failed to load order data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, delta: number) => {
    if (!cart) return;
    
    try {
      const item = cart.items.find(i => i.productId === productId);
      if (!item) return;
      
      const newQuantity = item.quantity + delta;
      await CartStorage.updateQuantity(productId, newQuantity);
      
      const updatedCart = await CartStorage.getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await CartStorage.removeItem(productId);
      const updatedCart = await CartStorage.getCart();
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const applyCoupon = async () => {
    if (!voucherCode.trim()) {
      Alert.alert('Error', 'Please enter a voucher code');
      return;
    }

    if (!currentUser || !cart) return;

    try {
      const result = await CouponService.applyCoupon(
        currentUser.id,
        voucherCode.toUpperCase(),
        cart.subtotal
      );

      if (result.success) {
        setAppliedDiscount(result.discount);
        Alert.alert('Success! 🎉', result.message);
      } else {
        Alert.alert('Oops!', result.message);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      Alert.alert('Error', 'Failed to apply voucher');
    }
  };

  const validateCheckout = (): boolean => {
    if (!currentUser) {
      Alert.alert('Error', 'User not logged in');
      return false;
    }

    if (!cart || cart.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return false;
    }

    if (!locationUser) {
      Alert.alert('Error', 'Please select a delivery address');
      navigate.navigate('AddressSelection');
      return false;
    }

    if (!selectedCard) {
      Alert.alert('Error', 'Please select a payment method');
      navigate.navigate('PaymentMethods');
      return false;
    }

    return true;
  };

  const createOrder = async (): Promise<Order> => {
    if (!currentUser || !cart || !locationUser || !selectedCard) {
      throw new Error('Missing required data');
    }

    const finalTotal = cart.subtotal + cart.deliveryFee - appliedDiscount;

    const order: Order = {
      id: `ORD-${Date.now()}`,
      userId: currentUser.id,
      items: cart.items,
      total: finalTotal,
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      discount: appliedDiscount,
      appliedCoupon: voucherCode || undefined,
      address: locationUser,
      paymentMethod: 'card',
      cardId: selectedCard.id,
      status: 'pending',
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
    };

    return order;
  };

  const handleCheckout = async () => {
    if (!validateCheckout()) return;

    try {
      setIsProcessing(true);

      const order = await createOrder();
      const savedOrder = await OrderStorage.saveOrder(order);

      OrderTrackingService.startOrderTracking(savedOrder.id);

      if (currentUser && Math.random() < 0.1) {
        setTimeout(async () => {
          await CouponService.distributeRandomCoupon(currentUser.id);
        }, 3000);
      }

      await CartStorage.clearCart();

      Alert.alert(
        'Success! 🎉',
        `Your order #${savedOrder.id.slice(-6)} has been placed successfully!\n\nEstimated delivery: 45 minutes`,
        [
          {
            text: 'View Order',
            onPress: () => {
              navigate.navigate('Order');
            }
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              navigate.navigate('Dashboard');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to process your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF6820" />
        <Text className="mt-4 text-gray-600">Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
          <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
            Checkout
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Add some delicious items to get started!
          </Text>
          <TouchableOpacity
            onPress={() => navigate.navigate('Dashboard')}
            className="bg-orange rounded-full px-8 py-4"
          >
            <Text className="text-white font-bold">Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tax = 5.00;
  const finalTotal = cart.subtotal + cart.deliveryFee + tax - appliedDiscount;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
          Checkout
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          {cart.items.map((item) => (
            <View
              key={item.productId}
              className="flex-row items-center bg-white rounded-2xl mb-3 p-3"
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                className="w-20 h-20 rounded-xl"
              />

              <View className="flex-1 ml-3">
                <Text className="text-base font-semibold text-gray-900">
                  {item.name}
                </Text>
                {item.notes && (
                  <Text className="text-xs text-gray-500 mb-1">
                    {item.notes}
                  </Text>
                )}
                <Text className="text-lg font-bold text-gray-900">
                  ${item.price.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center bg-gray-100 rounded-full px-2 py-1">
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, -1)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Text className="text-gray-600 text-xl font-bold">−</Text>
                </TouchableOpacity>
                <Text className="mx-3 text-base font-semibold text-gray-900">
                  {item.quantity.toString().padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.productId, 1)}
                  className="w-8 h-8 items-center justify-center"
                >
                  <Text className="text-gray-900 text-xl font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Address</Text>
            <TouchableOpacity onPress={() => navigate.navigate('AddressSelection')}>
              <Text className="text-orange font-semibold">
                {locationUser ? 'Change' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {locationUser ? (
            <TouchableOpacity
              onPress={() => navigate.navigate('AddressSelection')}
              className="bg-white rounded-2xl p-4 flex-row items-center"
            >
              <View className="w-16 h-16 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <MapPin color="#EF6820" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {locationUser.city}
                </Text>
                <Text className="text-sm text-gray-500">
                  {locationUser.address}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigate.navigate('AddressSelection')}
              className="bg-white rounded-2xl p-4 items-center border-2 border-dashed border-gray-300"
            >
              <MapPin color="#9CA3AF" size={32} />
              <Text className="text-gray-600 mt-2">Add delivery address</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-gray-900">Payment Method</Text>
            <TouchableOpacity onPress={() => navigate.navigate('PaymentMethods')}>
              <Text className="text-orange font-semibold">
                {selectedCard ? 'Change' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedCard ? (
            <TouchableOpacity
              onPress={() => navigate.navigate('PaymentMethods')}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-white rounded-xl items-center justify-center mr-3 border border-gray-200">
                  <View className="flex-row">
                    <View className="w-4 h-4 rounded-full bg-red-500 opacity-80" />
                    <View className="w-4 h-4 rounded-full bg-orange -ml-2" />
                  </View>
                </View>
                <View>
                  <Text className="text-base font-semibold text-gray-900 capitalize">
                    {selectedCard.brand}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    **** **** **** {selectedCard.number.slice(-4)}
                  </Text>
                </View>
              </View>
              <ChevronRight color="#9CA3AF" size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigate.navigate('PaymentMethods')}
              className="bg-white rounded-2xl p-4 items-center border-2 border-dashed border-gray-300"
            >
              <Text className="text-gray-600">Add payment method</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="px-4 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Voucher Code</Text>

          <View className="bg-white rounded-2xl p-4 flex-row items-center">
            <Tag color="#9CA3AF" size={20} />
            <TextInput
              value={voucherCode}
              onChangeText={setVoucherCode}
              placeholder="Enter voucher code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              className="flex-1 ml-3 text-base text-gray-900"
            />
            {voucherCode && (
              <TouchableOpacity onPress={applyCoupon}>
                <Text className="text-orange font-semibold">Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View className="px-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-900 font-semibold">
              ${cart.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Delivery Fee</Text>
            <Text className="text-gray-900 font-semibold">
              ${cart.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Tax</Text>
            <Text className="text-gray-900 font-semibold">${tax.toFixed(2)}</Text>
          </View>
          {appliedDiscount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-green-600 font-semibold">
                Discount ({voucherCode})
              </Text>
              <Text className="text-green-600 font-semibold">
                -${appliedDiscount.toFixed(2)}
              </Text>
            </View>
          )}
          <View className="border-t border-dashed border-gray-300 pt-4 flex-row justify-between">
            <Text className="text-lg font-bold text-gray-900">Total Payment</Text>
            <Text className="text-lg font-bold text-gray-900">
              ${finalTotal.toFixed(2)}
            </Text>
          </View>
        </View>
        <View className="px-4 pb-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isProcessing}
            className={`rounded-full py-4 items-center ${
              isProcessing ? 'bg-gray-400' : 'bg-orange'
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-bold">
                Proceed To Checkout
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

    
      <BottomTabBar activeTab='Checkout' />
    </SafeAreaView>
  );
};

export default Checkout;