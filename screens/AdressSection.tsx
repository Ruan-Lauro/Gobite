import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MapPin, Plus, Trash2 } from 'lucide-react-native';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { useLocation } from '../hooks/useLocation';
import {SessionStorage} from '../hooks/login';
import { Location } from 'types';
import { UserStorage } from 'hooks/user';

type AddressSelectionRouteProp = RouteProp<RootStackParamList, 'AddressSelection'>;

const AddressSelection: React.FC = () => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AddressSelectionRouteProp>();
  
  const [addresses, setAddresses] = useState<Location[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Location | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    location: currentLocation,
    isLoading: locationLoading,
    getSavedLocations,
    removeSavedLocation,
    setManualLocation
  } = useLocation({ idUser: currentUserId });

  useEffect(() => {
    loadUserAndAddresses();
  }, []);

  useEffect(() => {
    const unsubscribe = navigate.addListener('focus', () => {
      if (currentUserId) {
        loadAddresses();
      }
    });

    return unsubscribe;
  }, [navigate, currentUserId]);

  const loadUserAndAddresses = async () => {
    
    try {
      setIsLoadingAddresses(true);
    
      const user = await SessionStorage.getCurrentSession();
      if (user) {
        setCurrentUserId(user.user.id);
        await loadAddresses(user.user.id);
      }
    } catch (error) {
      console.error('Error loading user and addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const loadAddresses = async (userId?: string) => {
    try {
      const id = userId || currentUserId;
      if (!id) return;

      const savedAddresses = await getSavedLocations(id);
      setAddresses(savedAddresses);

      const session = await SessionStorage.getCurrentSession();  
      const allUsers = await UserStorage.getAllUsers();
      const currentUser = allUsers.find(u => u.id === session?.user.id);
      if (currentUser && currentUser.chooseLocation) {
          setSelectedAddress(currentUser.chooseLocation);
      }
      else if (savedAddresses.length > 0) {
        setSelectedAddress(savedAddresses[0]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const selectAddress = (address: Location) => {
    setSelectedAddress(address);
  };

  const handleDeleteAddress = async (address: Location) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(`${address.latitude}-${address.longitude}`);
              
              await removeSavedLocation(address.latitude, address.longitude);
              
              await loadAddresses();
              
              if (selectedAddress?.latitude === address.latitude && 
                  selectedAddress?.longitude === address.longitude) {
                setSelectedAddress(null);
              }
              
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const handleContinue = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address');
      return;
    }

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
        chooseLocation: selectedAddress,  
      });

      if(updatedUser){
        verifyUserAddress();
      }
      
      
    } catch (error) {
      console.error('Error setting address:', error);
      Alert.alert('Error', 'Failed to set address');
    }
  };


  const verifyUserAddress = async () =>{
    const session = await SessionStorage.getCurrentSession();
          
    const allUsers = await UserStorage.getAllUsers();
    const currentUser = allUsers.find(u => u.id === session?.user.id);
    if (!currentUser) {
      console.error('User not found');
      return;
    }
    
    if(JSON.stringify(currentUser.chooseLocation) === JSON.stringify(selectedAddress)){
      navigate.navigate('Checkout');
    }
  }

  const getAddressLabel = (address: Location): string => {
    
    if (address.reference) {
      return address.reference;
    }
    
    const addr = address.address.toLowerCase();
    if (addr.includes('rua') || addr.includes('avenida')) {
      return 'Home';
    } else if (addr.includes('comercial') || addr.includes('empresa')) {
      return 'Office';
    }
    
    return 'Address';
  };

  const formatAddress = (address: Location): string => {
    const parts = [];
    
    if (address.address) parts.push(address.address);
    if (address.complement) parts.push(address.complement);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    
    return parts.join(', ');
  };

  if (isLoadingAddresses) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#EF6820" />
        <Text className="mt-4 text-gray-600">Loading addresses...</Text>
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
          Select Address
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-12">
            <MapPin color="#9CA3AF" size={64} />
            <Text className="text-gray-600 text-center mt-4 text-base">
              No saved addresses yet
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm px-8">
              Add your first delivery address to get started
            </Text>
          </View>
        ) : (
          addresses.map((address, index) => {
            const addressKey = `${address.latitude}-${address.longitude}`;
            const isDeleting = deletingId === addressKey;
            const isSelected = selectedAddress?.latitude === address.latitude && 
                             selectedAddress?.longitude === address.longitude;

            return (
              <View
                key={addressKey}
                className="bg-white rounded-2xl mb-3 overflow-hidden"
              >
                <TouchableOpacity
                  onPress={() => selectAddress(address)}
                  disabled={isDeleting}
                  className="p-4 flex-row items-center"
                  activeOpacity={0.7}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                    isSelected ? 'bg-orange' : 'bg-orange'
                  }`}>
                    <MapPin color="#fff" size={24} />
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {getAddressLabel(address)}
                    </Text>
                    <Text className="text-sm text-gray-500" numberOfLines={2}>
                      {formatAddress(address)}
                    </Text>
                  </View>

                  <View className="flex-row items-center ml-2">
                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(address)}
                      disabled={isDeleting}
                      className="p-2 mr-2"
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <Trash2 color="#EF4444" size={20} />
                      )}
                    </TouchableOpacity>

                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'bg-orange border-orange' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <View className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <TouchableOpacity
          onPress={() => navigate.navigate('Location')}
          className="bg-white rounded-2xl p-4 flex-row items-center justify-center border-2 border-dashed border-gray-300 mt-2"
        >
          <Plus color="#F97316" size={20} />
          <Text className="text-base font-semibold text-gray-900 ml-2">
            Add New Address
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="px-4 pb-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!selectedAddress}
          className={`rounded-full py-4 items-center ${
            selectedAddress ? 'bg-orange' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white text-base font-bold">
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddressSelection;