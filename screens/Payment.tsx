import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { CardStorage } from '../hooks/card';
import { SavedCard } from '../types';
import { SessionStorage } from '../hooks/login';
import { UserStorage } from '../hooks/user';

const PaymentMethods: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [cardSelected, setCardSelected] = useState<SavedCard>();

  const loadCards = async () => {
    try {
      setLoading(true);
      const user = await SessionStorage.getCurrentSession();
      if (!user) {
        Alert.alert('Error', 'User not found. Please login again.');
        return;
      }
      setUserId(user.user.id);
      const allUsers = await UserStorage.getAllUsers();
      const currentUser = allUsers.find(u => u.id === user.user.id);
       if(currentUser && currentUser.chooseCard){
        setCardSelected(currentUser.chooseCard);
      }
      
      const userCards = await CardStorage.getCardsByUser(user.user.id);
      setCards(userCards);

    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load payment methods');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );


  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CardStorage.removeCard(cardId, userId);
              console.log('Card deleted:', cardId);
              await loadCards();
              Alert.alert('Success', 'Card deleted successfully');
            } catch (error) {
              console.error('Error deleting card:', error);
              Alert.alert('Error', 'Failed to delete card');
            }
          }
        }
      ]
    );
  };

  const handleContinue = async () => {
    
    if (cardSelected) {
      try {
        const session = await SessionStorage.getCurrentSession();
            
        const allUsers = await UserStorage.getAllUsers();
        const currentUser = allUsers.find(u => u.id === session?.user.id);
        
        if (!currentUser) {
          console.error('User not found');
          return;
        }
    
        const updatedUser = await UserStorage.updateUser({
          ...currentUser, 
          chooseCard: cardSelected,  
        });

        if(updatedUser){
          navigate.navigate('Checkout');
        }
        
      } catch (error) {
        console.error('Error setting address:', error);
        Alert.alert('Error', 'Failed to set address');
      }
    } else if (cards.length > 0) {
      Alert.alert('Error', 'Please select a payment method');
    } else {
      Alert.alert('No Cards', 'Please add a payment method first');
    }
  };

  const handleAddCard = () => {
    navigate.navigate('AddCard');
  };

  const maskCardNumber = (number: string) => {
    const last4 = number.slice(-4);
    return `**** **** **** ${last4}`;
  };

  const getCardIcon = (brand: string) => {
    const brandLower = brand.toLowerCase();
    
    if (brandLower === 'visa') {
      return (
        <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
          <Text className="text-blue-600 font-bold text-sm">VISA</Text>
        </View>
      );
    }
    
    if (brandLower === 'mastercard') {
      return (
        <View className="w-12 h-12 bg-white rounded-xl items-center justify-center border border-gray-200">
          <View className="flex-row">
            <View className="w-4 h-4 rounded-full bg-red-500 opacity-80" />
            <View className="w-4 h-4 rounded-full bg-orange -ml-2" />
          </View>
        </View>
      );
    }
    
    if (brandLower === 'amex') {
      return (
        <View className="w-12 h-12 bg-blue-600 rounded-xl items-center justify-center">
          <Text className="text-white font-bold text-xs">AMEX</Text>
        </View>
      );
    }
    
    if (brandLower === 'elo') {
      return (
        <View className="w-12 h-12 bg-black rounded-xl items-center justify-center">
          <Text className="text-yellow-400 font-bold text-sm">ELO</Text>
        </View>
      );
    }
    
    return (
      <View className="w-12 h-12 bg-gray-200 rounded-xl items-center justify-center">
        <Text className="text-gray-600 font-bold text-xs">CARD</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#F97316" />
        <Text className="text-gray-600 mt-4">Loading payment methods...</Text>
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
          Payment Methods
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {cards.length === 0 ? (
          <View className="items-center justify-center py-12">
            <View className="w-24 h-24 bg-orange rounded-full items-center justify-center mb-4">
              <Text className="text-5xl">💳</Text>
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              No Payment Methods
            </Text>
            <Text className="text-gray-500 text-base mb-8 text-center px-8">
              Add your first card to start making secure payments
            </Text>
            <TouchableOpacity
              onPress={handleAddCard}
              className="bg-orange rounded-full px-8 py-4 shadow-lg"
            >
              <Text className="text-white font-bold text-base">Add Your First Card</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-gray-900 font-bold text-lg mb-4">
              Saved Cards ({cards.length})
            </Text>
            
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                onPress={() => setCardSelected(card)}
                className={`bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow-sm ${
                  card.id === cardSelected?.id ? 'border-2 border-orange' : 'border border-gray-100'
                }`}
              >
                {getCardIcon(card.brand)}
                
                <View className="flex-1 ml-4">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {card.holder}
                  </Text>
                  <Text className="text-sm text-gray-500 mb-1">
                    {maskCardNumber(card.number)}
                  </Text>
                  {card.id === cardSelected?.id && (
                    <View className="bg-orange rounded-full px-3 py-1 self-start">
                      <Text className="text-white text-xs font-semibold">Default Card</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(card.id);
                  }}
                  className="mr-3 p-2 bg-red-50 rounded-lg"
                  activeOpacity={0.7}
                >
                  <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>

                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    card.id === cardSelected?.id ? 'bg-orange border-orange' : 'border-gray-300'
                  }`}
                >
                  {card.id === cardSelected?.id && (
                    <View className="w-3 h-3 bg-white rounded-full" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={handleAddCard}
              className="bg-white rounded-2xl p-4 flex-row items-center justify-center border-2 border-dashed border-orange mt-2"
            >
              <Plus color="#F97316" size={22} />
              <Text className="text-base font-semibold text-orange ml-2">
                Add New Card
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {cards.length > 0 && (
        <View className="px-4 pb-4 bg-white border-t border-gray-100">
          <TouchableOpacity
            onPress={handleContinue}
            className="bg-orange rounded-full py-4 items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-base font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default PaymentMethods;