import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";

export class StorageUtils {
  
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      throw new Error(`Error clearing all data: ${error}`);
    }
  }

  static async getStorageInfo(): Promise<{ [key: string]: number }> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const storageInfo: { [key: string]: number } = {};
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        storageInfo[key] = data ? JSON.stringify(data).length : 0;
      }
      
      return storageInfo;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {};
    }
  }

  static async exportAllData(): Promise<string> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const exportData: { [key: string]: any } = {};
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          exportData[key] = JSON.parse(data);
        }
      }
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      throw new Error(`Error exporting data: ${error}`);
    }
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const importData = JSON.parse(jsonData);
      
      for (const [key, value] of Object.entries(importData)) {
        if (Object.values(STORAGE_KEYS).includes(key as any)) {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      throw new Error(`Error importing data: ${error}`);
    }
  }
}