import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { ArrowLeft, Search, SlidersHorizontal, X, Plus } from 'lucide-react-native';
import { useMealDB } from '../hooks/useMeal';
import { useRecentSearches } from '../hooks/recenteSearch';
import { MenuItem } from '../types';
import { FilterModal } from '../components/FilterModal';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchScreenProps {
  navigation: any;
}

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  paymentType: 'now' | 'delivery';
  starRating: number[];
}

const SearchScreen: React.FC<SearchScreenProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [10, 500],
    categories: [],
    paymentType: 'now',
    starRating: [],
  });

  const {
    meals,
    loading,
    searchMealsByName,
    clearResults,
  } = useMealDB();

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearAllRecentSearches,
  } = useRecentSearches(currentUserId);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const session = await AsyncStorage.getItem('@delivery:current_session');
        if (session) {
          const { user } = JSON.parse(session);
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchMealsByName(query);
      if (currentUserId) {
        await addRecentSearch(query);
      }
    } else {
      clearResults();
    }
  };

  const handleRecentSearchPress = (term: string) => {
    setSearchQuery(term);
    handleSearch(term);
  };

  const convertMealToMenuItem = (meal: any): MenuItem => {
    const basePrice = Math.floor(Math.random() * 20) + 10;
    const hasDiscount = Math.random() > 0.5;
    const discount = hasDiscount ? Math.floor(Math.random() * 15) + 5 : undefined;
    
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      price: basePrice,
      image: meal.strMealThumb,
      rating: +(4 + Math.random()).toFixed(1),
      reviewCount: Math.floor(Math.random() * 100) + 20,
      deliveryTime: '15-30 min',
      distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
      discount,
    };
  };

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setIsFilterModalVisible(false);
    console.log('Applying filters:', newFilters);
  };

  const hotDealsData = [
    {
      id: '1',
      name: 'Classic Cheese Pizza',
      price: 15.00,
      rating: 4.2,
      reviewCount: 92,
      deliveryTime: '15-30 min',
      distance: '1.3 km',
      image: 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg',
    },
    {
      id: '2',
      name: 'Supreme Pizza',
      price: 20.00,
      rating: 4.2,
      reviewCount: 92,
      deliveryTime: '15-30 min',
      distance: '1.3 km',
      image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
    },
  ];

  const handleProductPress = (menuItem: MenuItem) => {
    navigate.navigate('ProductDetail', {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      description: 'Delicious pizza with fresh ingredients...',
      rating: menuItem.rating,
      reviewCount: menuItem.reviewCount,
      deliveryTime: '20 - 30min',
      freeDelivery: true
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigate.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 flex-1 text-center mr-6">
            Search
          </Text>
        </View>

        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Search color={'#697586'} size={20} />
          <TextInput
            placeholder="Search for Food.."
            className="flex-1 text-gray-700 ml-3 dark:text-black"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          <TouchableOpacity onPress={() => setIsFilterModalVisible(true)}>
            <SlidersHorizontal color={'#697586'} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {!searchQuery && recentSearches.length > 0 && (
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">Recent Search</Text>
              <TouchableOpacity onPress={clearAllRecentSearches}>
                <Text className="text-orange-500 font-medium">Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap gap-2">
              {recentSearches.map((search) => (
                <TouchableOpacity
                  key={search.id}
                  onPress={() => handleRecentSearchPress(search.term)}
                  className="bg-gray-100 rounded-full px-4 py-2 flex-row items-center"
                >
                  <Text className="text-gray-700 mr-2">{search.term}</Text>
                  <TouchableOpacity onPress={() => removeRecentSearch(search.id)}>
                    <X size={14} color="#6B7280" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {loading && (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-2">Searching...</Text>
          </View>
        )}

        {searchQuery && !loading && meals.length > 0 && (
          <View className="px-4 py-4">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Results for "{searchQuery}" ({meals.length})
            </Text>
            
            {meals.map((meal) => {
              const menuItem = convertMealToMenuItem(meal);
              return (
                <TouchableOpacity
                  key={meal.idMeal}
                  className="bg-white rounded-xl mb-3 p-4 flex-row shadow-sm"
                  onPress={() => handleProductPress(menuItem)}
                >
                  <Image
                    source={{ uri: meal.strMealThumb }}
                    className="w-16 h-16 rounded-lg"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                      {meal.strMeal}
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Text className="text-yellow-500">⭐</Text>
                      <Text className="text-gray-600 text-sm ml-1">
                        {menuItem.rating} ({menuItem.reviewCount} Reviews)
                      </Text>
                    </View>
                    <Text className="text-orange-500 font-bold text-lg">
                      ${menuItem.price.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    className="bg-orange-500 rounded-lg px-4 py-2 justify-center items-center"
                    onPress={() => handleProductPress(menuItem)}
                  >
                    <Plus size={16} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {searchQuery && !loading && meals.length === 0 && (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-lg">No results found for "{searchQuery}"</Text>
          </View>
        )}

        {!searchQuery && (
          <View className="px-4 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-gray-900 mr-2">Hot Deals</Text>
                <Text className="text-lg">🔥</Text>
              </View>
              <TouchableOpacity>
                <Text className="text-orange-500 font-medium">See All</Text>
              </TouchableOpacity>
            </View>

            {hotDealsData.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-white rounded-xl mb-3 p-4 flex-row shadow-sm"
                onPress={() => {
                  const menuItem: MenuItem = {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    rating: item.rating,
                    reviewCount: item.reviewCount,
                    deliveryTime: item.deliveryTime,
                    distance: item.distance,
                  };
                  handleProductPress(menuItem);
                }}
              >
                <Image
                  source={{ uri: item.image }}
                  className="w-16 h-16 rounded-lg"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-semibold mb-1">{item.name}</Text>
                  <View className="flex-row items-center mb-1">
                    <Text className="text-gray-500 text-sm">⏱️ {item.deliveryTime} • {item.distance}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-yellow-500">⭐</Text>
                    <Text className="text-gray-600 text-sm ml-1">
                      {item.rating} ({item.reviewCount} Reviews)
                    </Text>
                  </View>
                </View>
                <View className="items-end justify-center">
                  <Text className="text-orange-500 font-bold text-lg mb-2">
                    ${item.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity 
                    className="bg-orange-500 rounded-lg px-4 py-2"
                    onPress={() => {
                      const menuItem: MenuItem = {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        rating: item.rating,
                        reviewCount: item.reviewCount,
                        deliveryTime: item.deliveryTime,
                        distance: item.distance,
                      };
                      handleProductPress(menuItem);
                    }}
                  >
                    <View className="flex-row items-center">
                      <Plus size={14} color="white" />
                      <Text className="text-white font-semibold ml-1">Add</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={applyFilters}
      />
    </SafeAreaView>
  );
};

export default SearchScreen;