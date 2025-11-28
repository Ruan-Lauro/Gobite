import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  FileText,
  HelpCircle,
  CreditCard,
  MapPin,
  ChevronRight
} from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { SessionStorage } from '../hooks/login';
import { UserStorage } from '../hooks/user';
import { User as UserType } from 'types';
import { BottomTabBar } from 'components/BottomTabBar';

const Settings: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const session = await SessionStorage.getCurrentSession();
      const allUsers = await UserStorage.getAllUsers();
      const user = allUsers.find(u => u.id === session?.user.id);
      
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SessionStorage.clearSession();
              navigate.navigate('Login');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF6820" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <View className="bg-white rounded-2xl p-4 flex-row items-center">
            <View className="w-16 h-16 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
             <Image
                  source={currentUser!.img && currentUser!.img !== '' ? { uri: currentUser!.img } : require('../assets/gafiel.jpg')}
                  className="w-full h-full"
              />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-900">
                {currentUser?.name || 'User Name'}
              </Text>
              <Text className="text-sm text-gray-500">
                {currentUser?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">General</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={() => navigate.navigate('EditProfile')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <User color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Edit Profile</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate.navigate('ChangePassword')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <Lock color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Change Password</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate.navigate('AddressSelection')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <MapPin color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Manage Addresses</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigate.navigate('PaymentMethods')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <CreditCard color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Payment Methods</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Notifications', 'Coming soon...')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <Bell color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Notifications</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Security', 'Coming soon...')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <Shield color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Security</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Language', 'Coming soon...')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <Globe color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Language</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-base font-bold text-gray-900 mb-3">Preferences</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity
              onPress={() => Alert.alert('Legal and Policies', 'Coming soon...')}
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <FileText color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Legal and Policies</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Help & Support', 'Coming soon...')}
              className="flex-row items-center p-4"
            >
              <View className="w-10 h-10 bg-gray-100 rounded-xl items-center justify-center mr-3">
                <HelpCircle color="#EF6820" size={20} />
              </View>
              <Text className="flex-1 text-base text-gray-900">Help & Support</Text>
              <ChevronRight color="#EF6820" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-4 pb-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-2xl p-4 items-center border border-red-200"
          >
            <Text className="text-red-600 font-bold text-base">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomTabBar activeTab="Profile" />
    </SafeAreaView>
  );
};

export default Settings;