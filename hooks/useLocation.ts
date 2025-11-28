import { useState, useEffect } from 'react';
import * as ExpoLocation from 'expo-location';
import { Alert } from 'react-native';
import { LocationStorage } from './locatio';
import { Location } from '../types';

interface LocationState {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface UseLocationProps {
  idUser: string; 
}

export const useLocation = ({ idUser }: UseLocationProps) => {
  const [locationState, setLocationState] = useState<LocationState>({
    location: null,
    isLoading: false,
    error: null,
    hasPermission: false,
  });

  useEffect(() => {
    if (idUser) {
      checkLocationPermission();
      loadLastLocation();
    }
  }, [idUser]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      setLocationState(prev => ({ ...prev, hasPermission: status === 'granted' }));
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const loadLastLocation = async () => {
    try {
      const lastLocation = await LocationStorage.getLastLocation(idUser);
      if (lastLocation) {
        setLocationState(prev => ({ ...prev, location: lastLocation }));
      }
    } catch (error) {
      console.error('Error loading last location:', error);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationState(prev => ({ ...prev, hasPermission: granted }));
      
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to get your current address.',
          [{ text: 'OK' }]
        );
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationState(prev => ({ 
        ...prev, 
        error: 'Failed to request location permission',
        hasPermission: false 
      }));
      return false;
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<Partial<Location>> => {
    try {
      const reverseGeocodedAddress = await ExpoLocation.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocodedAddress && reverseGeocodedAddress.length > 0) {
        const address = reverseGeocodedAddress[0];
        
        return {
          address: `${address.street || ''} ${address.streetNumber || ''}`.trim() || 'Address not found',
          city: address.city || address.district || 'City not found',
          state: address.region || 'State not found',
          zipCode: address.postalCode || '00000-000',
        };
      }

      return await fetchAddressFromAPI(latitude, longitude);
      
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return await fetchAddressFromAPI(latitude, longitude);
    }
  };

  const fetchAddressFromAPI = async (latitude: number, longitude: number): Promise<Partial<Location>> => {
    try {
 
      const response = await fetch(
        `https://api.postmon.com.br/v1/geo/${latitude}/${longitude}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          address: data.address || 'Address not found',
          city: data.city || 'City not found',
          state: data.state || 'State not found',
          zipCode: data.zipcode || '00000-000',
        };
      }

      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
      );

      if (osmResponse.ok) {
        const osmData = await osmResponse.json();
        const addressComponents = osmData.address || {};
        
        return {
          address: `${addressComponents.road || ''} ${addressComponents.house_number || ''}`.trim() || 'Address not found',
          city: addressComponents.city || addressComponents.town || addressComponents.village || 'City not found',
          state: addressComponents.state || 'State not found',
          zipCode: addressComponents.postcode || '00000-000',
        };
      }

      throw new Error('Unable to fetch address from APIs');
      
    } catch (error) {
      console.error('API geocoding error:', error);
      return {
        address: 'Address not found',
        city: 'City not found',
        state: 'State not found',
        zipCode: '00000-000',
      };
    }
  };

  const getCurrentLocation = async (): Promise<Location | null> => {
    try {
      setLocationState(prev => ({ ...prev, isLoading: true, error: null }));

      const hasPermission = locationState.hasPermission || await requestLocationPermission();
      
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const currentPosition = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
        timeInterval: 10000,
      });

      const { latitude, longitude } = currentPosition.coords;

      const addressData = await reverseGeocode(latitude, longitude);

      const location: Location = {
        latitude,
        longitude,
        address: addressData.address || 'Address not found',
        city: addressData.city || 'City not found',
        state: addressData.state || 'State not found',
        zipCode: addressData.zipCode || '00000-000',
        complement: '', 
        reference: '', 
        idUser, 
      };

      await LocationStorage.saveLocation(location);

      setLocationState(prev => ({ 
        ...prev, 
        location, 
        isLoading: false, 
        error: null 
      }));

      return location;

    } catch (error) {
      console.error('Get current location error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get current location';
      
      setLocationState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));

      Alert.alert(
        'Location Error',
        errorMessage,
        [{ text: 'OK' }]
      );

      return null;
    }
  };

  const setManualLocation = async (location: Omit<Location, 'idUser'>) => {
    try {
      const locationWithUser: Location = {
        ...location,
        idUser, // Adiciona o ID do usuário
      };
        
      await LocationStorage.saveCurrentLocation(locationWithUser);
      await LocationStorage.saveLocation(locationWithUser);
      
      setLocationState(prev => ({ 
        ...prev, 
        location: locationWithUser, 
        error: null 
      }));
    } catch (error) {
      console.error('Error saving manual location:', error);
      setLocationState(prev => ({ 
        ...prev, 
        error: 'Failed to save location' 
      }));
    }
  };

  const clearLocation = () => {
    setLocationState(prev => ({ 
      ...prev, 
      location: null, 
      error: null 
    }));
  };

  const getSavedLocations = async (idUserN: string): Promise<Location[]> => {
    try {
   
      const locations = await LocationStorage.getLocations(idUserN);

      return locations;
    } catch (error) {
      console.error('Error getting saved locations:', error);
      return [];
    }
  };

  const removeSavedLocation = async (latitude: number, longitude: number): Promise<void> => {
    try {
      await LocationStorage.removeLocation(latitude, longitude, idUser);
      
      if (locationState.location?.latitude === latitude && 
          locationState.location?.longitude === longitude) {
        const lastLocation = await LocationStorage.getLastLocation(idUser);
        setLocationState(prev => ({ 
          ...prev, 
          location: lastLocation 
        }));
      }
    } catch (error) {
      console.error('Error removing location:', error);
      throw error;
    }
  };

  const migrateOldData = async () => {
    try {
      await LocationStorage.migrateToUserSpecific(idUser);
      await loadLastLocation();
    } catch (error) {
      console.error('Error migrating old data:', error);
    }
  };

  return {
    location: locationState.location,
    isLoading: locationState.isLoading,
    error: locationState.error,
    hasPermission: locationState.hasPermission,
    getCurrentLocation,
    setManualLocation,
    clearLocation,
    requestLocationPermission,
    getSavedLocations,
    removeSavedLocation,
    loadLastLocation,
    migrateOldData, 
  };
};