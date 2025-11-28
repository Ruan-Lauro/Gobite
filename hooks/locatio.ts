import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";
import { Location } from "types";

export class LocationStorage {
  
  static async saveLocation(location: Location): Promise<void> {
    try {
      const existingLocations = await this.getLocations(location.idUser);
      
      const existingIndex = existingLocations.findIndex(
        loc => loc.latitude === location.latitude && loc.longitude === location.longitude
      );
      
      let updatedLocations: Location[];
      
      if (existingIndex !== -1) {
        updatedLocations = [...existingLocations];
        updatedLocations[existingIndex] = location;
      } else {
        updatedLocations = [...existingLocations, location];
      }
      
      const storageKey = `${STORAGE_KEYS.LOCATIONS}_${location.idUser}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedLocations));
    } catch (error) {
      throw new Error(`Error saving location: ${error}`);
    }
  }

  static async saveCurrentLocation(location: Location): Promise<void> {
    try {
      const storageKey = `${STORAGE_KEYS.CURRENT_LOCATION}_${location.idUser}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(location));
    } catch (error) {
      throw new Error(`Error saving current location: ${error}`);
    }
  }

  static async getCurrentLocation(idUser: string): Promise<Location | null> {
    try {
      const storageKey = `${STORAGE_KEYS.CURRENT_LOCATION}_${idUser}`;
      const location = await AsyncStorage.getItem(storageKey);
      return location ? JSON.parse(location) : null;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  static async getLocations(idUser: string): Promise<Location[]> {
    try {
      const storageKey = `${STORAGE_KEYS.LOCATIONS}_${idUser}`;
      const locations = await AsyncStorage.getItem(storageKey);
      return locations ? JSON.parse(locations) : [];
    } catch (error) {
      console.error('Error getting locations:', error);
      return [];
    }
  }

  static async getLastLocation(idUser: string): Promise<Location | null> {
    try {
      const locations = await this.getLocations(idUser);
      return locations.length > 0 ? locations[locations.length - 1] : null;
    } catch (error) {
      console.error('Error getting last location:', error);
      return null;
    }
  }

  static async removeLocation(latitude: number, longitude: number, idUser: string): Promise<void> {
    try {
      const locations = await this.getLocations(idUser);
      const updatedLocations = locations.filter(
        loc => !(loc.latitude === latitude && loc.longitude === longitude)
      );
      
      const storageKey = `${STORAGE_KEYS.LOCATIONS}_${idUser}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedLocations));
    } catch (error) {
      throw new Error(`Error removing location: ${error}`);
    }
  }

  static async saveToFavorites(location: Location): Promise<void> {
    try {
      const existingLocations = await this.getLocations(location.idUser);
      
      const exists = existingLocations.find(
        loc => loc.latitude === location.latitude && 
               loc.longitude === location.longitude
      );
      
      if (!exists) {
        const updatedLocations = [...existingLocations, location];
        const storageKey = `${STORAGE_KEYS.LOCATIONS}_${location.idUser}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(updatedLocations));
      }
    } catch (error) {
      throw new Error(`Error saving to favorites: ${error}`);
    }
  }

  static async clearUserLocations(idUser: string): Promise<void> {
    try {
      const locationsKey = `${STORAGE_KEYS.LOCATIONS}_${idUser}`;
      const currentLocationKey = `${STORAGE_KEYS.CURRENT_LOCATION}_${idUser}`;
      
      await AsyncStorage.removeItem(locationsKey);
      await AsyncStorage.removeItem(currentLocationKey);
    } catch (error) {
      throw new Error(`Error clearing user locations: ${error}`);
    }
  }

  static async migrateToUserSpecific(idUser: string): Promise<void> {
    try {
      const oldLocations = await AsyncStorage.getItem(STORAGE_KEYS.LOCATIONS);
      const oldCurrentLocation = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      
      if (oldLocations) {
        const locations: Location[] = JSON.parse(oldLocations);
        const updatedLocations = locations.map(loc => ({ ...loc, idUser }));
        
        const newKey = `${STORAGE_KEYS.LOCATIONS}_${idUser}`;
        await AsyncStorage.setItem(newKey, JSON.stringify(updatedLocations));
        await AsyncStorage.removeItem(STORAGE_KEYS.LOCATIONS); 
      }
      
      if (oldCurrentLocation) {
        const location: Location = JSON.parse(oldCurrentLocation);
        const updatedLocation = { ...location, idUser };
        
        const newKey = `${STORAGE_KEYS.CURRENT_LOCATION}_${idUser}`;
        await AsyncStorage.setItem(newKey, JSON.stringify(updatedLocation));
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_LOCATION); 
      }
    } catch (error) {
      console.error('Error migrating to user-specific storage:', error);
    }
  }
}