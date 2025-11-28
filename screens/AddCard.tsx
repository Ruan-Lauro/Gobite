import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { CardStorage } from '../hooks/card';
import { SessionStorage } from '../hooks/login'; 

const AddCard: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [expireDate, setExpireDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await SessionStorage.getCurrentSession(); 
      if (!user) {
        Alert.alert('Error', 'User not found. Please login again.');
        navigate.goBack();
        return;
      }
      setUserId(user.user.id);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user information');
      navigate.goBack();
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpireDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
  };

  const handleExpireDateChange = (text: string) => {
    const formatted = formatExpireDate(text);
    setExpireDate(formatted);
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setCvv(cleaned.slice(0, 3));
  };

  const detectCardBrand = (number: string): 'visa' | 'mastercard' | 'elo' | 'amex' => {
    const cleaned = number.replace(/\s/g, '');
    
    if (cleaned.startsWith('4')) return 'visa';
    
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
    
    if (/^3[47]/.test(cleaned)) return 'amex';
    
    if (/^(4011|4312|4389|4514|5041|5066|5090|6277|6362|6363|6504|6505|6516)/.test(cleaned)) {
      return 'elo';
    }
    
    return 'mastercard';
  };

  const validateCard = (): boolean => {
    if (!cardHolder.trim()) {
      Alert.alert('Error', 'Please enter card holder name');
      return false;
    }

    const cleanedNumber = cardNumber.replace(/\s/g, '');
    if (cleanedNumber.length < 13 || cleanedNumber.length > 16) {
      Alert.alert('Error', 'Please enter a valid card number');
      return false;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return false;
    }

    if (!expireDate || expireDate.length !== 5) {
      Alert.alert('Error', 'Please enter expiration date (MM/YY)');
      return false;
    }

    const [month, year] = expireDate.split('/').map(Number);
    if (month < 1 || month > 12) {
      Alert.alert('Error', 'Invalid month');
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      Alert.alert('Error', 'Card has expired');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }

    if (!validateCard()) return;

    try {
      setSaving(true);
      
      const cleanedNumber = cardNumber.replace(/\s/g, '');
      const brand = detectCardBrand(cleanedNumber);

      await CardStorage.saveCard({
        number: cleanedNumber,
        holder: cardHolder.trim(),
        brand: brand,
        isDefault: false,
        idUser: userId,
      }, userId);

      console.log('Card saved for user:', userId);

      Alert.alert('Success', 'Card added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setCardHolder('');
            setCardNumber('');
            setCvv('');
            setExpireDate('');
            navigate.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving card:', error);
      Alert.alert('Error', 'Failed to save card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const displayCardNumber = cardNumber || '5294 2436 4780 9568';
  const displayExpireDate = expireDate || '12/24';
  const displayCardHolder = cardHolder || 'Card Holder Name';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="bg-white px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => navigate.goBack()} 
          className="mr-4"
          disabled={saving}
        >
          <ChevronLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
          Add Card
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-6">
     
          <View className="flex-row mb-6 bg-gray-100 rounded-full p-1">
            <TouchableOpacity
              onPress={() => setCardType('credit')}
              disabled={saving}
              className={`flex-1 py-3 rounded-full ${
                cardType === 'credit' ? 'bg-orange' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  cardType === 'credit' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Credit Card
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCardType('debit')}
              disabled={saving}
              className={`flex-1 py-3 rounded-full ${
                cardType === 'debit' ? 'bg-orange' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  cardType === 'debit' ? 'text-white' : 'text-gray-500'
                }`}
              >
                Debit Card
              </Text>
            </TouchableOpacity>
          </View>

        
          <View className="rounded-3xl p-6 mb-6 shadow-lg" style={{
            backgroundColor: '#1F2937'
          }}>
          
            <View className="mb-8">
              <Text className="text-white text-sm mb-1 opacity-80">
                Current Balance
              </Text>
              <Text className="text-white text-3xl font-bold">
                Card
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-white text-lg tracking-widest font-mono">
                {displayCardNumber}
              </Text>
            </View>

            <View className="flex-row justify-between items-end">
              <View>
                <Text className="text-white text-xs opacity-60 mb-1">
                  Card Holder
                </Text>
                <Text className="text-white text-sm font-semibold">
                  {displayCardHolder}
                </Text>
              </View>
              <View>
                <Text className="text-white text-xs opacity-60 mb-1">
                  Expire Date
                </Text>
                <Text className="text-white text-sm font-semibold">
                  {displayExpireDate}
                </Text>
              </View>

              <View className="flex-row">
                <View className="w-8 h-8 rounded-full bg-red-500 opacity-80" />
                <View className="w-8 h-8 rounded-full bg-orange -ml-3" />
              </View>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-900 font-semibold mb-2">
              Card Holder Name
            </Text>
            <TextInput
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Enter name"
              placeholderTextColor="#9CA3AF"
              editable={!saving}
              autoCapitalize="words"
              className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-900 font-semibold mb-2">
              Card Number
            </Text>
            <TextInput
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="Enter card number"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={19}
              editable={!saving}
              className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
            />
          </View>

          <View className="flex-row mb-6">
            <View className="flex-1 mr-2">
              <Text className="text-gray-900 font-semibold mb-2">CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={handleCvvChange}
                placeholder="Cvv"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                editable={!saving}
                className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-gray-900 font-semibold mb-2">
                Expire Date
              </Text>
              <TextInput
                value={expireDate}
                onChangeText={handleExpireDateChange}
                placeholder="Date"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={5}
                editable={!saving}
                className="bg-white rounded-2xl px-4 py-4 text-base text-gray-900"
              />
            </View>
          </View>
        </ScrollView>

        <View className="px-4 pb-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleContinue}
            disabled={saving}
            className={`rounded-full py-4 items-center ${
              saving ? 'bg-orange/70' : 'bg-orange'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-bold">Continue</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddCard;