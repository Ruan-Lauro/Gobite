import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentSearch {
  id: string;
  term: string;
  userId: string;
  searchedAt: string;
}

interface UserRecentSearches {
  userId: string;
  searches: RecentSearch[];
}

const STORAGE_KEY = '@delivery:recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const useRecentSearches = (userId: string) => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentSearches = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        const allSearches: UserRecentSearches[] = JSON.parse(stored);
        const userSearches = allSearches.find(s => s.userId === userId);
        
        if (userSearches) {
          setRecentSearches(userSearches.searches);
        } else {
          setRecentSearches([]);
        }
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
      setRecentSearches([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addRecentSearch = useCallback(async (term: string) => {
    try {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let allSearches: UserRecentSearches[] = stored ? JSON.parse(stored) : [];

      const userIndex = allSearches.findIndex(s => s.userId === userId);
      
      let userSearches: RecentSearch[] = [];
      if (userIndex !== -1) {
        userSearches = allSearches[userIndex].searches;
      }

      const existingIndex = userSearches.findIndex(
        s => s.term.toLowerCase() === trimmedTerm.toLowerCase()
      );

      if (existingIndex !== -1) {
        userSearches.splice(existingIndex, 1);
      }

      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        term: trimmedTerm,
        userId,
        searchedAt: new Date().toISOString(),
      };

      userSearches = [newSearch, ...userSearches].slice(0, MAX_RECENT_SEARCHES);

      if (userIndex !== -1) {
        allSearches[userIndex].searches = userSearches;
      } else {
        allSearches.push({
          userId,
          searches: userSearches,
        });
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
      setRecentSearches(userSearches);
    } catch (error) {
      console.error('Error adding recent search:', error);
      throw error;
    }
  }, [userId]);

  const removeRecentSearch = useCallback(async (searchId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const allSearches: UserRecentSearches[] = JSON.parse(stored);
      const userIndex = allSearches.findIndex(s => s.userId === userId);

      if (userIndex !== -1) {
        allSearches[userIndex].searches = allSearches[userIndex].searches.filter(
          s => s.id !== searchId
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
        setRecentSearches(allSearches[userIndex].searches);
      }
    } catch (error) {
      console.error('Error removing recent search:', error);
      throw error;
    }
  }, [userId]);

  const clearAllRecentSearches = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setRecentSearches([]);
        return;
      }

      const allSearches: UserRecentSearches[] = JSON.parse(stored);
      const userIndex = allSearches.findIndex(s => s.userId === userId);

      if (userIndex !== -1) {
        allSearches[userIndex].searches = [];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allSearches));
      }

      setRecentSearches([]);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
      throw error;
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadRecentSearches();
    }
  }, [userId, loadRecentSearches]);

  return {
    recentSearches,
    loading,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
    refreshRecentSearches: loadRecentSearches,
  };
};