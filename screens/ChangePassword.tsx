import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { SessionStorage } from '../hooks/login';
import { UserStorage } from '../hooks/user';
import { User } from 'types';

const ChangePassword: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return {
        isValid: false,
        message: 'Password must be at least 8 characters long'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one uppercase letter'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one lowercase letter'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        message: 'Password must contain at least one number'
      };
    }

    return { isValid: true, message: '' };
  };

  const validateForm = (): boolean => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return false;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Error', 'Please confirm your new password');
      return false;
    }

    if (currentUser?.password && currentPassword !== currentUser.password) {
      Alert.alert('Error', 'Current password is incorrect');
      return false;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Weak Password', passwordValidation.message);
      return false;
    }

    if (newPassword === currentPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm() || !currentUser) return;

    try {
      setIsSaving(true);

      const updatedUser: User = {
        ...currentUser,
        password: newPassword
      };

      await UserStorage.updateUser(updatedUser);

      Alert.alert(
        'Success! 🎉',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => navigate.goBack()
          }
        ]
      );

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const getPasswordStrength = (password: string): {
    strength: number;
    label: string;
    color: string;
  } => {
    if (!password) return { strength: 0, label: '', color: '#E5E7EB' };

    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) {
      return { strength: 1, label: 'Weak', color: '#EF4444' };
    } else if (strength <= 4) {
      return { strength: 2, label: 'Medium', color: '#F59E0B' };
    } else {
      return { strength: 3, label: 'Strong', color: '#10B981' };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

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
          Change Password
        </Text>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-6">
          <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
            <Text className="text-sm text-blue-900 font-semibold mb-1">
              Password Requirements:
            </Text>
            <Text className="text-xs text-blue-700">
              • At least 8 characters long{'\n'}
              • One uppercase letter{'\n'}
              • One lowercase letter{'\n'}
              • One number
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Current Password
            </Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center">
              <Lock color="#9CA3AF" size={20} />
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                className="flex-1 ml-3 text-base text-gray-900"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff color="#9CA3AF" size={20} />
                ) : (
                  <Eye color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              New Password
            </Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center">
              <Lock color="#9CA3AF" size={20} />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                className="flex-1 ml-3 text-base text-gray-900"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff color="#9CA3AF" size={20} />
                ) : (
                  <Eye color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <View className="mt-2">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-gray-600">Password strength</Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </Text>
                </View>
                <View className="flex-row h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(passwordStrength.strength / 3) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Confirm New Password
            </Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center">
              <Lock color="#9CA3AF" size={20} />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                className="flex-1 ml-3 text-base text-gray-900"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff color="#9CA3AF" size={20} />
                ) : (
                  <Eye color="#9CA3AF" size={20} />
                )}
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <View className="mt-2">
                {newPassword === confirmPassword ? (
                  <Text className="text-xs text-green-600 font-semibold">
                    ✓ Passwords match
                  </Text>
                ) : (
                  <Text className="text-xs text-red-600 font-semibold">
                    ✗ Passwords do not match
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="bg-gray-100 rounded-2xl p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              💡 Security Tips
            </Text>
            <Text className="text-xs text-gray-600 leading-5">
              • Never share your password with anyone{'\n'}
              • Use a unique password for this account{'\n'}
              • Change your password regularly{'\n'}
              • Avoid using personal information
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={isSaving}
          className={`rounded-full py-4 items-center ${
            isSaving ? 'bg-gray-400' : 'bg-orange'
          }`}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-bold">
              Change Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;