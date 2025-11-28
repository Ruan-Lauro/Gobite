import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "key";
import { SavedCard } from "types";

export class CardStorage {
  
  static async saveCard(card: Omit<SavedCard, 'id'>, userId: string): Promise<SavedCard> {
    try {
      const existingCards = await this.getCardsByUser(userId);
      
      const newCard: SavedCard = {
        ...card,
        id: Date.now().toString(),
        idUser: userId,
      };

      if (existingCards.length === 0 || card.isDefault) {
        existingCards.forEach(c => c.isDefault = false);
        newCard.isDefault = true;
      }

      const allCards = await this.getAllCards();
      
      const updatedCards = [...allCards, newCard];
      
      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updatedCards));
      
      return newCard;
    } catch (error) {
      throw new Error(`Error saving card: ${error}`);
    }
  }

  private static async getAllCards(): Promise<SavedCard[]> {
    try {
      const cards = await AsyncStorage.getItem(STORAGE_KEYS.CARDS);
      return cards ? JSON.parse(cards) : [];
    } catch (error) {
      console.error('Error getting all cards:', error);
      return [];
    }
  }


  static async getCardsByUser(userId: string): Promise<SavedCard[]> {
    try {
      const allCards = await this.getAllCards();
      return allCards.filter(card => card.idUser === userId);
    } catch (error) {
      console.error('Error getting cards by user:', error);
      return [];
    }
  }

  static async getDefaultCard(userId: string): Promise<SavedCard | null> {
    try {
      const userCards = await this.getCardsByUser(userId);
      return userCards.find(card => card.isDefault) || null;
    } catch (error) {
      console.error('Error getting default card:', error);
      return null;
    }
  }

  static async setDefaultCard(cardId: string, userId: string): Promise<void> {
    try {
      const allCards = await this.getAllCards();
      
      allCards.forEach(card => {
        if (card.idUser === userId) {
          card.isDefault = false;
        }
      });
      
      const targetCard = allCards.find(card => card.id === cardId && card.idUser === userId);
      if (targetCard) {
        targetCard.isDefault = true;
        await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
      } else {
        throw new Error('Card not found or does not belong to this user');
      }
    } catch (error) {
      throw new Error(`Error setting default card: ${error}`);
    }
  }

  static async removeCard(cardId: string, userId: string): Promise<void> {
    try {
      const allCards = await this.getAllCards();
      
      const cardToRemove = allCards.find(card => card.id === cardId && card.idUser === userId);
      if (!cardToRemove) {
        throw new Error('Card not found or does not belong to this user');
      }
      

      const updatedCards = allCards.filter(card => card.id !== cardId);
      
        if (cardToRemove.isDefault) {
        const userCards = updatedCards.filter(card => card.idUser === userId);
        if (userCards.length > 0) {
          const firstUserCard = updatedCards.find(card => card.idUser === userId);
          if (firstUserCard) {
            firstUserCard.isDefault = true;
          }
        }
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updatedCards));
    } catch (error) {
      throw new Error(`Error removing card: ${error}`);
    }
  }

  static async updateCard(cardId: string, userId: string, updates: Partial<Omit<SavedCard, 'id' | 'idUser'>>): Promise<SavedCard> {
    try {
      const allCards = await this.getAllCards();
      
      const cardIndex = allCards.findIndex(card => card.id === cardId && card.idUser === userId);
      if (cardIndex === -1) {
        throw new Error('Card not found or does not belong to this user');
      }

      allCards[cardIndex] = {
        ...allCards[cardIndex],
        ...updates,
      };

      if (updates.isDefault === true) {
        allCards.forEach((card, index) => {
          if (card.idUser === userId && index !== cardIndex) {
            card.isDefault = false;
          }
        });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(allCards));
      
      return allCards[cardIndex];
    } catch (error) {
      throw new Error(`Error updating card: ${error}`);
    }
  }

  static async getCardById(cardId: string, userId: string): Promise<SavedCard | null> {
    try {
      const allCards = await this.getAllCards();
      return allCards.find(card => card.id === cardId && card.idUser === userId) || null;
    } catch (error) {
      console.error('Error getting card by ID:', error);
      return null;
    }
  }

  static async deleteAllUserCards(userId: string): Promise<void> {
    try {
      const allCards = await this.getAllCards();
      const updatedCards = allCards.filter(card => card.idUser !== userId);
      await AsyncStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(updatedCards));
    } catch (error) {
      throw new Error(`Error deleting user cards: ${error}`);
    }
  }
}