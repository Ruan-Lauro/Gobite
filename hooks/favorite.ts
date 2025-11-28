import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MenuItem } from '../types';

export interface FavoriteItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  userId: string;
  favoritedAt: string;
}

interface UserFavorites {
  userId: string;
  items: FavoriteItem[];
}

const STORAGE_KEY = '@delivery:favorites';

export const useFavorites = (userId: string) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const allFavorites: UserFavorites[] = JSON.parse(stored);
        const userFavorites = allFavorites.find(f => f.userId === userId);
        
        if (userFavorites) {
          setFavorites(userFavorites.items);
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.some(fav => fav.productId === productId);
  }, [favorites]);

  const addFavorite = useCallback(async (item: MenuItem) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let allFavorites: UserFavorites[] = stored ? JSON.parse(stored) : [];

      // Encontrar índice do usuário
      const userIndex = allFavorites.findIndex(f => f.userId === userId);
      
      let userFavorites: FavoriteItem[] = [];
      if (userIndex !== -1) {
        userFavorites = allFavorites[userIndex].items;
      }

      // Verificar se já existe
      if (userFavorites.some(fav => fav.productId === item.id)) {
        console.log('Item já está nos favoritos');
        return;
      }

      // Criar novo favorito
      const newFavorite: FavoriteItem = {
        id: Date.now().toString(),
        productId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        rating: item.rating,
        reviewCount: item.reviewCount,
        userId,
        favoritedAt: new Date().toISOString(),
      };

      // Adicionar no início
      userFavorites = [newFavorite, ...userFavorites];

      // Atualizar ou criar registro do usuário
      if (userIndex !== -1) {
        allFavorites[userIndex].items = userFavorites;
      } else {
        allFavorites.push({
          userId,
          items: userFavorites,
        });
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [userId]);

  const removeFavorite = useCallback(async (productId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allFavorites: UserFavorites[] = JSON.parse(stored);
      const userIndex = allFavorites.findIndex(f => f.userId === userId);

      if (userIndex !== -1) {
        allFavorites[userIndex].items = allFavorites[userIndex].items.filter(
          fav => fav.productId !== productId
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
        setFavorites(allFavorites[userIndex].items);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [userId]);

  const toggleFavorite = useCallback(async (item: MenuItem) => {
    try {
      if (isFavorite(item.id)) {
        await removeFavorite(item.id);
      } else {
        await addFavorite(item);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  const clearAllFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setFavorites([]);
        return;
      }

      const allFavorites: UserFavorites[] = JSON.parse(stored);
      const userIndex = allFavorites.findIndex(f => f.userId === userId);

      if (userIndex !== -1) {
        allFavorites[userIndex].items = [];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
      }

      setFavorites([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadFavorites();
    }
  }, [userId, loadFavorites]);

  return {
    favorites,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    refreshFavorites: loadFavorites,
  };
};