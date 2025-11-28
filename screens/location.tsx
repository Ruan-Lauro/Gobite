import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MoveLeft, MapPin, Navigation, Edit3, Trash2, Home } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import Input from 'components/input';
import Buttons from 'components/button';
import { useLocation } from '../hooks/useLocation';
import { Location, User } from '../types';
import {SessionStorage} from '../hooks/login';

export default function LocationScreen() {
  const [showSavedLocations, setShowSavedLocations] = useState(false);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [manualAddress, setManualAddress] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualZipCode, setManualZipCode] = useState('');
  const [manualComplement, setManualComplement] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [user, setUser] = useState<User>();

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const {
    location,
    isLoading,
    error,
    hasPermission,
    getCurrentLocation,
    setManualLocation,
    clearLocation,
    getSavedLocations,
    removeSavedLocation,
    
  } = useLocation({ idUser: user?.id! });

  useEffect(() => {
    valLogin();
  }, []); 

  useEffect(() => {
    if(user && user.id){
      alert(user.name + ' ' + user.id);
      loadSavedLocations(user.id);
    }
  }, [user]);

  const valLogin = async () => {
    const user = await SessionStorage.getCurrentSession();
    if(user) {
      setUser(user.user);
    }
  };

  const loadSavedLocations = async (idUserN: string) => {
    try {
      const locations = await getSavedLocations(idUserN);
      setSavedLocations(locations);
    } catch (error) {
      console.error('Error loading saved locations:', error);
    }
  };

 
  useEffect(() => {
    if (location && !showSavedLocations && !isAutoFilled) {
      setManualAddress(location.address);
      setManualCity(location.city);
      setManualState(location.state);
      setManualZipCode(location.zipCode);
      setIsAutoFilled(true);
    }
  }, [location, showSavedLocations, isAutoFilled]); 

  const handleGetCurrentLocation = async () => {
    setShowSavedLocations(false);
    await getCurrentLocation();
  };

  const handleClearFields = () => {
    setManualAddress('');
    setManualCity('');
    setManualState('');
    setManualZipCode('');
    setIsAutoFilled(false);
    setShowSavedLocations(false);
    clearLocation();
  };

  const handleShowSavedLocations = () => {
    setShowSavedLocations(true);
    setIsAutoFilled(false);
    clearLocation();
    if (user && user.id) {
      loadSavedLocations(user.id);
    }
  };

  const handleSelectSavedLocation = (selectedLocation: Location) => {
    setManualAddress(selectedLocation.address);
    setManualCity(selectedLocation.city);
    setManualState(selectedLocation.state);
    setManualZipCode(selectedLocation.zipCode);
    setManualComplement(selectedLocation.complement);
    setManualReference(selectedLocation.reference);
    setShowSavedLocations(false);
    setIsAutoFilled(false);
  };

  const handleDeleteSavedLocation = async (locationToDelete: Location) => {
    Alert.alert(
      'Delete Location',
      'Are you sure you want to delete this saved location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user && user.id) {
                await removeSavedLocation(locationToDelete.latitude, locationToDelete.longitude);
                await loadSavedLocations(user.id);
               
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete location');
            }
          },
        },
      ]
    );
  };

  const formatZipCode = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 8) digits = digits.slice(0, 8);
    
    if (digits.length <= 8) {
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  const validateFields = (): boolean => {
    if (!manualAddress.trim()) {
      Alert.alert('Error', 'Please enter the address');
      return false;
    }
    if (!manualCity.trim()) {
      Alert.alert('Error', 'Please enter the city');
      return false;
    }
    if (!manualState.trim()) {
      Alert.alert('Error', 'Please enter the state');
      return false;
    }
    if (!manualZipCode.trim()) {
      Alert.alert('Error', 'Please enter the ZIP code');
      return false;
    }
    if (!manualReference.trim()) {
      Alert.alert('Error', 'Please enter the reference');
      return false;
    }
    if (!manualComplement.trim()) {
      Alert.alert('Error', 'Please enter the complement');
      return false;
    }
    
    const zipDigits = manualZipCode.replace(/\D/g, '');
    if (zipDigits.length !== 8) {
      Alert.alert('Error', 'Please enter a valid ZIP code');
      return false;
    }

    return true;
  };

  const handleSaveLocation = async () => {
    if (!validateFields()) return;

    if(!user){
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    const finalLocation: Location = {
      idUser: user.id, 
      latitude: location?.latitude || 0, 
      longitude: location?.longitude || 0,
      address: manualAddress.trim(),
      city: manualCity.trim(),
      state: manualState.trim(),
      zipCode: manualZipCode.trim(),
      complement: manualComplement.trim(),
      reference: manualReference.trim(),
    };

    console.log('Salvando localização:', finalLocation);

    await setManualLocation(finalLocation);

    Alert.alert(
      'Success',
      'Location saved successfully!',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Dashboard');
          },
        },
      ]
    );
  };

  const renderSavedLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      onPress={() => handleSelectSavedLocation(item)}
      className="p-4 bg-gray-50 rounded-xl mb-3 border border-gray-200"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Home width={16} height={16} color="#6B7280" />
            <Text className="font-semibold text-gray-800 ml-2">
              Saved Location
            </Text>
          </View>
          <Text className="text-gray-700 text-sm mb-1">
            {item.address}
          </Text>
          <Text className="text-gray-600 text-xs">
            {item.city} - {item.state}, {item.zipCode}
          </Text>
          <View className='flex' >
            {item.complement && (
              <Text className="text-gray-500 text-xs mt-1">
                {item.complement}
              </Text>
            )}
            {item.reference && (
              <Text className="text-gray-500 text-xs mt-1">
                {item.reference}
              </Text>
              )}
          </View>
        </View>
        
        <TouchableOpacity
          onPress={() => handleDeleteSavedLocation(item)}
          className="p-2 ml-3"
        >
          <Trash2 width={18} height={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="mt-14 px-5">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="bg-orange w-12 h-12 flex items-center justify-center rounded-full"
          >
            <MoveLeft width={30} color="white" />
          </TouchableOpacity>

          <Text className="text-3xl font-bold mt-10 mb-1">Your Location</Text>
          <Text className="text-lg text-black/70">
            Fill in your delivery address
          </Text>

          <View className="mt-10 space-y-4 gap-3">
            <TouchableOpacity
              onPress={handleGetCurrentLocation}
              disabled={isLoading}
              className="flex-row items-center p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
            >
              <View className="bg-orange/20 p-3 rounded-full mr-4">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FF6B35" />
                ) : (
                  <Navigation width={24} height={24} color="#FF6B35" />
                )}
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg">Auto-Fill Current Location</Text>
                <Text className="text-gray-600 text-sm">
                  {isLoading 
                    ? 'Getting your location...' 
                    : hasPermission 
                    ? 'Fill address fields automatically'
                    : 'Location permission required'
                  }
                </Text>
              </View>
            </TouchableOpacity>

            {savedLocations.length > 0 && (
              <TouchableOpacity
                onPress={handleShowSavedLocations}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  showSavedLocations 
                    ? 'border-orange bg-orange/10' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <View className="bg-orange/20 p-3 rounded-full mr-4">
                  <Home width={24} height={24} color="#FF6B35" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-lg">Use Saved Location</Text>
                  <Text className="text-gray-600 text-sm">
                    {savedLocations.length} saved location(s)
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleClearFields}
              className="flex-row items-center p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
            >
              <View className="bg-orange/20 p-3 rounded-full mr-4">
                <Edit3 width={24} height={24} color="#FF6B35" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-lg">Clear & Enter Manually</Text>
                <Text className="text-gray-600 text-sm">
                  Start fresh with empty fields
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {error && (
            <View className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          {isAutoFilled && !showSavedLocations && (
            <View className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <View className="flex-row items-center mb-2">
                <MapPin width={20} height={20} color="#059669" />
                <Text className="font-semibold text-green-800 ml-2">
                  Address Auto-Filled
                </Text>
              </View>
              <Text className="text-green-700 text-sm">
                Basic address information has been filled automatically. Please complete the complement and reference fields below.
              </Text>
            </View>
          )}

          {showSavedLocations && (
            <View className="mt-6">
              <Text className="font-semibold text-lg mb-4">Choose a saved location:</Text>
              <FlatList
                data={savedLocations}
                renderItem={renderSavedLocationItem}
                keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                scrollEnabled={false}
              />
            </View>
          )}

          <View className="mt-6 space-y-4 gap-3">
            <Text className="font-semibold text-lg mb-2">Address Details</Text>
            
            <Input
              placeholder="Street address"
              value={manualAddress}
              onchange={setManualAddress}
              Secure={false}
              type="streetAddressLine1"
              name="Address"
            />

            <Input
              placeholder="City"
              value={manualCity}
              onchange={setManualCity}
              Secure={false}
              type="addressCity"
              name="City"
            />

            <Input
              placeholder="State"
              value={manualState}
              onchange={setManualState}
              Secure={false}
              type="addressState"
              name="State"
            />

            <Input
              placeholder="ZIP Code"
              value={manualZipCode}
              onchange={(value) => setManualZipCode(formatZipCode(value))}
              Secure={false}
              type="postalCode"
              name="ZIP Code"
            />

            <View className="mt-2 gap-3">
            
              
              <Input
                placeholder="Apartment, suite, etc."
                value={manualComplement}
                onchange={setManualComplement}
                Secure={false}
                type="streetAddressLine2"
                name="Complement"
              />

              <Input
                placeholder="Reference point (nearby landmarks)"
                value={manualReference}
                onchange={setManualReference}
                Secure={false}
                type="none"
                name="Reference"
              />
            </View>
          </View>

          <Buttons
            authentication={handleSaveLocation}
            textButton="Confirm Location"
            Condition
            className="mt-8 mb-6"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}