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
import { ChevronLeft, Camera } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { SessionStorage } from '../hooks/login';
import { UserStorage } from '../hooks/user';
import { User } from 'types';
import * as ImagePicker from 'expo-image-picker';

const EditProfile: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to upload photos.'
      );
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const session = await SessionStorage.getCurrentSession();
      const allUsers = await UserStorage.getAllUsers();
      const user = allUsers.find(u => u.id === session?.user.id);
      
      if (user) {
        setCurrentUser(user);
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setImage(user.img || null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto
        },
        {
          text: 'Choose from Library',
          onPress: pickImage
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !currentUser) return;

    try {
      setIsSaving(true);

      if (email !== currentUser.email) {
        const allUsers = await UserStorage.getAllUsers();
        const emailExists = allUsers.some(
          u => u.email === email && u.id !== currentUser.id
        );
        
        if (emailExists) {
          Alert.alert('Error', 'Email already in use by another account');
          return;
        }
      }

      if (phone !== currentUser.phone) {
        const allUsers = await UserStorage.getAllUsers();
        const phoneExists = allUsers.some(
          u => u.phone === phone && u.id !== currentUser.id
        );
        
        if (phoneExists) {
          Alert.alert('Error', 'Phone number already in use by another account');
          return;
        }
      }

      const updatedUser: User = {
        ...currentUser,
        name,
        email,
        phone,
        img: image || currentUser.img
      };

      await UserStorage.updateUser(updatedUser);

      const session = await SessionStorage.getCurrentSession();
      if (session) {
        await SessionStorage.saveSession({
          ...session,
          user: updatedUser
        });
      }

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigate.navigate('Setting')
        }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 8) {
      formatted = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    }
    
    setPhone(formatted);
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

      <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
          Personal Data
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-6">
          <View className="relative">
            <View className="w-32 h-32 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {name?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={showImageOptions}
              className="absolute bottom-0 right-0 w-12 h-12 bg-orange rounded-full items-center justify-center border-4 border-white shadow-lg"
            >
              <Camera color="white" size={20} />
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 mt-2">
            Tap camera icon to change photo
          </Text>
        </View>

        <View className="px-4">
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Full Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2">Phone Number</Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center">
              <Text className="text-base text-gray-900 mr-2">🇧🇷 +55</Text>
              <TextInput
                value={phone}
                onChangeText={formatPhone}
                placeholder="(85) 98765-4321"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="flex-1 text-base text-gray-900"
                maxLength={15}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className={`rounded-full py-4 items-center ${
            isSaving ? 'bg-gray-400' : 'bg-orange'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;