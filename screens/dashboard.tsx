import React, { use, useEffect, useState } from 'react';
import {Search, SlidersHorizontal, Bell  } from 'lucide-react-native';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StatusBar
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { CategoryButton } from '../components/CategoryButton';
import { RestaurantCard } from '../components/RestaurantCard';
import { HotDealCard } from '../components/HotDealCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { MenuItem, CategoryProduct, User } from '../types';
import { useMealDB } from 'hooks/useMeal';
import {SessionStorage} from '../hooks/login';
import {useLocation} from "../hooks/useLocation";
import pizza from '../assets/pizza.jpg';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';
import { NotificationService } from 'hooks/NotificationService';

interface DashboardProps {
  navigation: any;
}

const Dashboard: React.FC<DashboardProps> = () => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User>();
  const [location, setLocation] = useState<string>('');

  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const{getSavedLocations} = useLocation({ idUser: "1"});

   useEffect(() => {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 10000);
      return () => clearInterval(interval);
    }, []);
  
    const loadUnreadCount = async () => {
      const count = await NotificationService.getUnreadCount();
      setUnreadNotifications(count);
    };

  const {
    categories,
    meals,
    mealsSummary,
    loading,
    error,
    fetchMealsByCategory,
    clearResults,
    searchMealsByNameCategory
  } = useMealDB();

  const formattedCategories: CategoryProduct[] = categories.map((cat, index) => ({
    id: cat.idCategory,
    name: cat.strCategory,
    icon: getCategoryIcon(cat.strCategory),
    color: getCategoryColor(index)
  }));

  function getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Beef': '🥩',
      'Chicken': '🍗',
      'Dessert': '🍰',
      'Lamb': '🐑',
      'Miscellaneous': '🍽️',
      'Pasta': '🍝',
      'Pork': '🐷',
      'Seafood': '🦐',
      'Side': '🥗',
      'Starter': '🥟',
      'Vegan': '🥬',
      'Vegetarian': '🥕',
      'Breakfast': '🍳',
      'Goat': '🐐',
    };
    return iconMap[categoryName] || '🍽️';
  }

  function getCategoryColor(index: number): string {
    const colors = ['orange', 'yellow', 'amber', 'red', 'green', 'blue', 'purple', 'pink'];
    return colors[index % colors.length];
  }

  function convertMealToMenuItem(meal: any): MenuItem {
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      price: Math.floor(Math.random() * 20) + 10,
      image: meal.strMealThumb,
      rating: +(4 + Math.random()).toFixed(2),
      reviewCount: Math.floor(Math.random() * 100) + 20,
      deliveryTime: '15-30 min',
      distance: `${(Math.random() * 3 + 0.5).toFixed(2)} km`,
      discount: Math.random() > 0.5 ? Math.floor(Math.random() * 15) + 5 : undefined,
    };
  }

  useEffect(() => {
    if (formattedCategories.length > 0 && !activeCategory) {
      setActiveCategory(formattedCategories[0].id);
      fetchMealsByCategory(formattedCategories[0].name);
    }
  }, [formattedCategories, activeCategory, fetchMealsByCategory]);

  const handleCategoryPress = (categoryId: string) => {
    setActiveCategory(categoryId);
    const category = formattedCategories.find(cat => cat.id === categoryId);
    
    if (category) {
      if (searchQuery.trim()) {
        searchMealsByNameCategory(searchQuery, category.name);
      } else {
        clearResults(); 
        fetchMealsByCategory(category.name);
      }
    }
  };

  const handleSearchPress = () => {
    navigate.navigate('Search');
  };

  const handleRestaurantPress = (item: MenuItem) => {

    navigate.navigate('ProductDetail', {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: 'Delicious pizza with fresh ingredients...',
      rating: item.rating,
      reviewCount: item.reviewCount,
      deliveryTime: '20 - 30min',
      freeDelivery: true
    });
  };

  const handleHotDealPress = (item: MenuItem) => {
    console.log("Aqui")
    navigate.navigate('ProductDetail', {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      description: 'Delicious pizza with fresh ingredients...',
      rating: item.rating,
      reviewCount: item.reviewCount,
      deliveryTime: '20 - 30min',
      freeDelivery: true
    });
  };

  useEffect(() => {
    if (error) {
      Alert.alert('Erro', error);
    }
  }, [error]);


   useEffect(() => {
      valLogin();
    }, []); 
  
  const valLogin = async () => {
    const user = await SessionStorage.getCurrentSession();
    if(user) {
      setUser(user.user);
      console.log(user.user);
      const userLocation = await getSavedLocations(user.user.id);
      if(userLocation && userLocation.length > 0){
        setLocation(userLocation[0].address);
      } 
    }
  };

  const displayMeals = searchQuery !== '' ? meals : (mealsSummary.length > 0 ? mealsSummary : []);

  function setUnreadCount(count: number) {
    throw new Error('Function not implemented.');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View className="bg-white px-4 py-3">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Image source={user?.img && user.img !== ''?{uri:user?.img}:require('../assets/gafiel.jpg')} className="w-12 h-12 rounded-full mr-3" />
            <View>
              <Text className="text-lg font-semibold text-gray-900">
                {user?.name?.split(' ').slice(0, 2).join(' ')}
              </Text>
              <Text className="text-gray-500 text-sm">
                📍 {location?location:'Not registered'}
              </Text>
            </View>
          </View>
          <View className="relative" onTouchEnd={()=>{
            navigate.navigate('Notifications');
          }}>
            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Bell color={'#697586'} width={20} />
            </View>
            {unreadNotifications > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSearchPress}
          className="flex-row items-center bg-gray-100 rounded-full px-4 py-3"
        >
          <Search color={'#697586'} />
          <Text className="flex-1 text-gray-500 ml-3">
            Search for Food..
          </Text>
          <SlidersHorizontal color={'#697586'} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="px-4 py-4">
          <View className="bg-black rounded-2xl overflow-hidden relative">
            <View className="p-6">
              <Text className="text-white text-2xl font-bold mb-2">
                UP TO 30% OFF
              </Text>
              <Text className="text-white text-2xl font-bold mb-4">
                ON FIRST ORDER
              </Text>
              <TouchableOpacity className="bg-white px-6 py-2 rounded-full self-start">
                <Text className="text-black font-semibold">Order Now</Text>
              </TouchableOpacity>
            </View>
            <View className="absolute right-0 top-0 bottom-0 w-full -z-10 ">
              <Image source={pizza} className="w-full h-full" />
            </View>
          </View>
        </View>

        <View className="px-4 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {formattedCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isActive={activeCategory === category.id}
                onPress={() => handleCategoryPress(category.id)}
              />
            ))}
          </ScrollView>
        </View>

        {loading && (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#F97316" />
            <Text className="text-gray-500 mt-2">Carregando...</Text>
          </View>
        )}

        {!loading && displayMeals.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900">
                {searchQuery ? `Results "${searchQuery}"` : 'Popular dishes'}
              </Text>
              {/* <TouchableOpacity>
                <Text className="text-orange-500 font-medium">See All</Text>
              </TouchableOpacity> */}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {displayMeals.slice(0, 6).map((meal) => {
                  const menuItem = convertMealToMenuItem(meal);
                  return (
                    <View key={meal.idMeal} className="mr-4 w-64">
                      <RestaurantCard
                        item={menuItem}
                        onPress={() => handleRestaurantPress(menuItem)}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {!loading && displayMeals.length > 0 && (
          <View className="px-4 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-gray-900 mr-2">
                  Hot Deals
                </Text>
                <Text className="text-2xl">🔥</Text>
              </View>
              {/* <TouchableOpacity>
                <Text className="text-orange-500 font-medium">See All</Text>
              </TouchableOpacity> */}
            </View>

            {displayMeals.slice(6, 10).map((meal) => {
              const menuItem = convertMealToMenuItem(meal);
              return (
                <HotDealCard
                  key={meal.idMeal}
                  item={menuItem}
                  onPress={() => handleHotDealPress(menuItem)}
                />
              );
            })}
          </View>
        )}

        {!loading && displayMeals.length === 0 && (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-lg">
              {searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum prato encontrado'}
            </Text>
          </View>
        )}
      </ScrollView>
      

      <BottomTabBar
        activeTab='Home'
      />


    </SafeAreaView>
  );
};

export default Dashboard;