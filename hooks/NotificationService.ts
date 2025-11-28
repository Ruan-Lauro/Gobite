import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../key';

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  expiryDate: string;
  isUsed: boolean;
  minOrderValue?: number;
}

export interface AppNotification {
  id: string;
  type: 'coupon' | 'order_ready' | 'delivery' | 'general';
  title: string;
  body: string;
  image?: string;
  data?: any;
  timestamp: string;
  read: boolean;
  coupon?: Coupon;
  orderId?: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static isExpoGo = Constants.appOwnership === 'expo';
  
  static async initialize() {
    console.log(`🔔 Notification Service initialized (${this.isExpoGo ? 'Expo Go' : 'Standalone'} mode)`);
    
    try {
      await this.requestNotificationPermissions();
      await this.setupNotificationListeners();
      
      if (Platform.OS === 'android') {
        await this.setupAndroidChannel();
      }
    } catch (error) {
      console.log('Notification initialization error:', error);
    }
  }

  static async setupAndroidChannel() {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
      
      await Notifications.setNotificationChannelAsync('orders', {
        name: 'Order Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#EF6820',
        sound: 'default',
      });
      
      await Notifications.setNotificationChannelAsync('coupons', {
        name: 'Coupons & Promotions',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250],
        lightColor: '#10B981',
        sound: 'default',
      });
      
      console.log('✅ Android notification channels created');
    } catch (error) {
      console.log('⚠️ Error creating Android channels:', error);
    }
  }

  static async requestNotificationPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('⚠️ Notification permissions not granted');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  }

  static async setupNotificationListeners() {
    try {
      Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received:', notification.request.content.title);
      });

      Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('👆 Notification tapped:', data);
        
        if (data.screen) {
          const deeplink = typeof data.deeplink === 'string' && data.deeplink.length > 0
            ? data.deeplink
            : `myapp://notification/${data.notificationId}`;
          Linking.openURL(deeplink);
        }
      });
      
      console.log('✅ Notification listeners configured');
    } catch (error) {
      console.log('Listener setup error:', error);
    }
  }

  static async sendNotification(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    await this.saveNotification(newNotification);

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            ...notification.data,
            notificationId: newNotification.id,
            screen: this.getScreenForType(notification.type),
            deeplink: this.getDeeplinkForNotification(newNotification),
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, 
      });
      
      console.log('✅ Local notification sent:', notification.title, 'ID:', notificationId);
      return newNotification;
    } catch (error) {
      console.log('⚠️ Notification display error:', error);
      console.log('📱 Notification saved to storage only');
      return newNotification;
    }
  }

  static async scheduleNotification(
    notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>,
    delayInSeconds: number
  ) {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(Date.now() + delayInSeconds * 1000).toISOString(),
      read: false,
    };

    await this.saveNotification(newNotification);

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            ...notification.data,
            notificationId: newNotification.id,
            screen: this.getScreenForType(notification.type),
            deeplink: this.getDeeplinkForNotification(newNotification),
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        //@ts-ignore
        trigger: {
          seconds: delayInSeconds,
          repeats: false
        },
      });
      
      console.log(`⏰ Notification scheduled for ${delayInSeconds}s:`, notification.title, 'ID:', notificationId);
      return newNotification;
    } catch (error) {
      console.log('⚠️ Notification scheduling error:', error);
      return newNotification;
    }
  }

  static async sendInAppAlert(notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    await this.saveNotification(newNotification);
    
    Alert.alert(
      notification.title,
      notification.body,
      [
        {
          text: 'OK',
          onPress: () => console.log('Notification acknowledged'),
        },
      ]
    );
    
    return newNotification;
  }

  static getScreenForType(type: AppNotification['type']): string {
    switch (type) {
      case 'coupon':
        return 'Notifications';
      case 'order_ready':
      case 'delivery':
        return 'OrderTracking';
      default:
        return 'Notifications';
    }
  }

  static getDeeplinkForNotification(notification: AppNotification): string {
    const baseUrl = 'myapp://';
    
    switch (notification.type) {
      case 'coupon':
        return `${baseUrl}notification/${notification.id}`;
      case 'order_ready':
      case 'delivery':
        return `${baseUrl}order/${notification.orderId}`;
      default:
        return `${baseUrl}notification/${notification.id}`;
    }
  }

  static async saveNotification(notification: AppNotification) {
    try {
      const notifications = await this.getAllNotifications();
      const updated = [notification, ...notifications];
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      console.log('💾 Notification saved to storage');
    } catch (error) {
      console.error('❌ Error saving notification:', error);
    }
  }

  static async getAllNotifications(): Promise<AppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  }

  static async getUnreadCount(): Promise<number> {
    const notifications = await this.getAllNotifications();
    return notifications.filter(n => !n.read).length;
  }

  static async markAsRead(notificationId: string) {
    try {
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }

  static async markAllAsRead() {
    try {
      const notifications = await this.getAllNotifications();
      const updated = notifications.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }

  static async deleteNotification(notificationId: string) {
    try {
      const notifications = await this.getAllNotifications();
      const updated = notifications.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }

  static async clearAllNotifications() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      await Notifications.dismissAllNotificationsAsync();
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🗑️ All notifications cleared');
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  static async cancelScheduledNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('❌ Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.log('Error cancelling notification:', error);
    }
  }
}