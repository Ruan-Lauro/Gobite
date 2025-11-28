import { STORAGE_KEYS } from "key";
import { User } from "types";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserStorage {
  
  static async saveUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const existingUsers = await this.getAllUsers();
      
      const emailExists = existingUsers.some(u => u.email === user.email);
      if (emailExists) {
        throw new Error('Email already registered');
      }

      const numberExists = existingUsers.some(u => u.phone === user.phone);
      if (numberExists) {
        throw new Error('Phone Number already registered');
      }

      const newUser: User = {
        ...user,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
  
      const updatedUsers = [...existingUsers, newUser];
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
      
      return newUser;
    } catch (error) {
      throw new Error(`Error saving user: ${error}`);
    }
  }

  static async getAllUsers(): Promise<User[]> {
    try {
      const users = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.email === email) || null;
    } catch (error) {
      console.error('Error finding user:', error);
      return null;
    }
  }

  static async findUserByPhone(phone: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.phone === phone) || null;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  static async findUserByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(u => u.email === emailOrPhone || u.phone === emailOrPhone) || null;
    } catch (error) {
      console.error('Error finding user by email or phone:', error);
      return null;
    }
  }

  static async validateCredentials(emailOrPhone: string, password: string): Promise<User | null> {
    try {
      const user = await this.findUserByEmailOrPhone(emailOrPhone);
      
      if (!user || !user.password) {
        return null;
      }

      // Simple password comparison (in production, use proper hashing like bcrypt)
      if (user.password === password) {
        // Return user without password for security
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }

      return null;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  }

  static async updateUser(updatedUser: User): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const index = users.findIndex(u => u.id === updatedUser.id);
      
      if (index !== -1) {
        users[index] = updatedUser;
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
     return true;
    } catch (error) {
      throw new Error(`Error updating user: ${error}`);
    }
  }
}