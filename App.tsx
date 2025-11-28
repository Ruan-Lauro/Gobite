import './global.css';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';

import { NotificationService } from './hooks/NotificationService';
import { CouponService } from './hooks/CouponService';
import { OrderTrackingService } from './hooks/OrderTrackingService';

// === Import das telas ===
import HomeScreen from 'screens/homeScreen';
import InitialImg from 'screens/initialImg';
import SecondInitialImg from 'screens/secondInitialImg';
import Login from 'screens/login';
import Registration from 'screens/registration';
import Location from 'screens/location';
import Dashboard from 'screens/dashboard';
import addPhoto from 'screens/addPhoto';
import SearchScreen from 'screens/searchScreen';
import ProductDetail from 'screens/ProductDetail';
import AddressSelection from 'screens/AdressSection';
import Checkout from 'screens/Checkout';
import PaymentMethods from 'screens/Payment';
import AddCard from 'screens/AddCard';
import OrderScreen from 'screens/OrderScreen';
import Settings from 'screens/Setting';
import EditProfile from 'screens/EditProfile';
import ChangePassword from 'screens/ChangePassword';
import NotificationsScreen from 'screens/Notifications';
import OrderDetailsScreen from 'screens/OrderDetailsScreen';

// === Tipagem das rotas ===
export type RootStackParamList = {
  initialScreen: undefined;
  secondInitialScreen: undefined;
  Home: undefined;
  Login: undefined;
  Registration: undefined;
  Location: undefined;
  AddPhoto: undefined;
  Dashboard: undefined;
  Search: undefined;
  ProductDetail: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    freeDelivery: boolean;
  };
  AddCart: undefined;
  AddCard: undefined;
  AddressSelection: undefined;
  Order: undefined;
  Checkout: undefined;
  PaymentMethods: undefined;
  Setting: undefined;
  ChangePassword: undefined;
  EditProfile: undefined;
  Notifications: undefined;
  OrderTracking?: { orderId: string };
  OrderDetails: { orderId: string }; // 🆕 Nova rota
};

// === Configuração do stack ===
const Stack = createNativeStackNavigator<RootStackParamList>();

// === Deep linking ===
const prefix = Linking.createURL('/');
const linking = {
  prefixes: [prefix, 'myapp://'],
  config: {
    screens: {
      Login: 'login',
      Dashboard: 'dashboard',
      Notifications: {
        path: 'notification/:notificationId?',
        parse: {
          notificationId: (id: string) => id,
        },
      },
      OrderTracking: {
        path: 'order/:orderId',
        parse: {
          orderId: (id: string) => id,
        },
      },
      OrderDetails: {
        path: 'order-details/:orderId',
        parse: {
          orderId: (id: string) => id,
        },
      },
      ProductDetail: 'product/:id',
      Search: 'search',
      Location: 'location',
    },
  },
};

export default function App() {
  const navigationRef = useRef<any>(null);
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    const initializeApp = async () => {
      // Inicializar serviços de notificações e cupons
      await NotificationService.initialize();
      await CouponService.initialize();
      console.log('✅ Services initialized');
    };

    initializeApp();

    // Escuta notificações recebidas
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
      }
    );

    // Quando o usuário toca em uma notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('👆 Notification tapped:', data);

        if (navigationRef.current) {
          if (data.orderId) {
            // Navega para detalhes do pedido
            navigationRef.current.navigate('OrderDetails', {
              orderId: data.orderId,
            });
          } else if (data.notificationId) {
            // Navega para lista de notificações
            navigationRef.current.navigate('Notifications');
          }
        }
      }
    );

    // Cleanup ao desmontar
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }

      // Limpar todos os timers de tracking
      OrderTrackingService.clearAllTimers();
      console.log('🧹 Services cleaned up');
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator 
        initialRouteName="initialScreen" 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="initialScreen" component={InitialImg} />
        <Stack.Screen name="secondInitialScreen" component={SecondInitialImg} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Registration" component={Registration} />
        <Stack.Screen name="Location" component={Location} />
        <Stack.Screen name="AddPhoto" component={addPhoto} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="AddressSelection" component={AddressSelection} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="Order" component={OrderScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="AddCard" component={AddCard} />
        <Stack.Screen name="Setting" component={Settings} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}