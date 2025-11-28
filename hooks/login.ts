import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";
import { UserSession } from "types";
import { UserStorage } from "./user"; 

export class SessionStorage {
  
  static async loginUser(emailOrPhone: string, password: string, rememberUser: boolean = false): Promise<UserSession | null> {
    try {
      const user = await UserStorage.validateCredentials(emailOrPhone, password);
      
      if (!user) {
        return null;
      }

      const session: UserSession = {
        user,
        token: `token_${user.id}_${Date.now()}`, 
        loginDate: new Date().toISOString(),
        rememberUser,
      };

      await this.saveSession(session);
      return session;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  }

  static async saveSession(session: UserSession): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
    } catch (error) {
      throw new Error(`Error saving session: ${error}`);
    }
  } 

  static async getCurrentSession(): Promise<UserSession | null> {
    try {
      const session = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      throw new Error(`Error clearing session: ${error}`);
    }
  }

  static async isUserLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return session !== null;
    } catch (error) {
      return false;
    }
  }
}