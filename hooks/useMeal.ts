import { useState, useEffect, useCallback } from 'react';
import { CategoriesResponse, MealsResponse, MealsSummaryResponse, UseMealDBState } from 'types';



const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

export const useMealDB = () => {
  const [state, setState] = useState<UseMealDBState>({
    categories: [],
    meals: [],
    mealsSummary: [],
    loading: false,
    error: null,
  });

  const fetchCategories = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${BASE_URL}/categories.php`);
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }
      
      const data: CategoriesResponse = await response.json();
      setState(prev => ({
        ...prev,
        categories: data.categories,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, []);

  const fetchMealsByCategory = useCallback(async (category: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar refeições da categoria');
      }
      
      const data: MealsSummaryResponse = await response.json();
      setState(prev => ({
        ...prev,
        mealsSummary: data.meals || [],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, []);

  const searchMealsByName = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, meals: [], error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar refeições');
      }
      
      const data: MealsResponse = await response.json();
      setState(prev => ({
        ...prev,
        meals: data.meals || [],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, []);
  

  const searchMealsByNameCategory = useCallback(async (query: string, category: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, meals: [], error: null }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar refeições da categoria');
      }

      const data: MealsSummaryResponse = await response.json();

      const filtered = (data.meals?.filter(meal =>
        meal.strMeal.toLowerCase().includes(query.toLowerCase())
      ).map(meal => ({
        ...meal,
        strInstructions: '',
      })) || []);

      setState(prev => ({
        ...prev,
        meals: filtered, 
        mealsSummary: [], 
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, []);

  const fetchMealById = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes da refeição');
      }
      
      const data: MealsResponse = await response.json();
      setState(prev => ({
        ...prev,
        meals: data.meals || [],
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        loading: false,
      }));
    }
  }, []);

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      meals: [],
      mealsSummary: [],
      error: null,
    }));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories: state.categories,
    meals: state.meals,
    mealsSummary: state.mealsSummary,
    loading: state.loading,
    error: state.error,
    
    // Funções
    fetchCategories,
    fetchMealsByCategory,
    searchMealsByName,
    fetchMealById,
    clearResults,
    searchMealsByNameCategory,
  };
};