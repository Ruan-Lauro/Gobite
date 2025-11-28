import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useNavigation, NavigationProp } from '@react-navigation/native';
import { CartStorage } from '../hooks/cart';
import { SessionStorage } from 'hooks/login';
import { useFavorites } from 'hooks/favorite';
import { MenuItem } from 'types';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  freeDelivery: boolean;
}

interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
}

type RootStackParamList = {
  ProductDetail: {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    rating: number;
    reviewCount: number;
    deliveryTime: string;
    freeDelivery: boolean;
  };
};

type ProductDetailRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetail: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const navigate = useNavigation<NavigationProp<RootStackParamList>>();

  const [userId, setUserId] = useState<string | undefined>(undefined);
    useEffect(() => {
      const fetchUserId = async () => {
        const user = await SessionStorage.getCurrentSession();
        if (user) {
          setUserId(user.user.id);
        }
      };
      fetchUserId();
    }, []);
    const { toggleFavorite } = useFavorites(userId || '0');

  useEffect(() => {
    const loadProduct = () => {
      setLoading(true);
      
      try {
        if (route.params) {
          const productData: Product = {
            id: route.params.id,
            name: route.params.name,
            price: route.params.price,
            image: route.params.image,
            description: route.params.description,
            rating: route.params.rating,
            reviewCount: route.params.reviewCount,
            deliveryTime: route.params.deliveryTime,
            freeDelivery: route.params.freeDelivery,
          };
          setProduct(productData);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [route.params]);
  
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Dianne Russell',
      userImage: 'https://images.unsplash.com/photo-1751716534754-e4eb69f18e90?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      rating: 4.5,
      comment: 'Amazing! The burger was juicier and tastier than expected. Perfectly grilled with fresh toppings. Highly recommend!'
    },
    {
      id: '2',
      userName: 'Cody Fisher',
      userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.4,
      comment: 'The burger was cooked to perfection, and the flavors were spot on. Loved the special sauce — definitely coming back for more!'
    },
    {
      id: '3',
      userName: 'Jacob Jones',
      userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      comment: 'Incredible! The burger was even better than the pictures. The patty was so flavorful, and the bun was soft and fresh. A must-try!'
    },
    {
      id: '4',
      userName: 'Esther Howard',
      userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.4,
      comment: 'The burger was delicious, and the portion size was just right. Loved the combination of textures and flavors. Great job!'
    }
  ];

  const handleQuantityChange = (increment: boolean) => {
    if (increment) {
      setQuantity(prev => prev + 1);
    } else {
      setQuantity(prev => prev > 1 ? prev - 1 : 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      };

      await CartStorage.addItem(cartItem);
      Alert.alert('Success', 'Item added to cart successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFA500" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFA500" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFA500" />
      );
    }

    return stars;
  };

  const renderRatingBars = () => {
    if (!product) return null;
    
    const ratings = [5, 4, 3, 2, 1];
    const totalReviews = product.reviewCount;
    
    // Mock distribution for rating bars
    const distribution = {
      5: Math.floor(totalReviews * 0.4),
      4: Math.floor(totalReviews * 0.35),
      3: Math.floor(totalReviews * 0.15),
      2: Math.floor(totalReviews * 0.07),
      1: Math.floor(totalReviews * 0.03),
    };

    return ratings.map((rating) => {
      const count = distribution[rating as keyof typeof distribution] || 0;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      
      return (
        <View key={rating} className="flex-row items-center mb-1">
          <Text className="text-gray-600 w-2 text-sm">{rating}</Text>
          <View className="flex-1 bg-gray-200 h-2 rounded-full mx-3">
            <View 
              className="bg-orange h-full rounded-full" 
              style={{ width: `${percentage}%` }}
            />
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text className="text-gray-600 mt-4">Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="flex-row items-center justify-between px-4 py-3 bg-white">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Product Not Found</Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-1 justify-center items-center px-4">
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B35" />
          <Text className="text-2xl font-bold text-gray-900 mt-4 text-center">
            Product Not Found
          </Text>
          <Text className="text-gray-600 mt-2 text-center leading-6">
            The product you're looking for doesn't exist or has been removed from our menu.
          </Text>
          
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-orange rounded-full px-8 py-4 mt-8"
          >
            <Text className="text-white font-semibold text-lg">
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleToggleFavorite = async () => {
    if (!product) return;

    try {
       await toggleFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        reviewCount: product.reviewCount,
        deliveryTime: product.deliveryTime,
        distance: '0 km',
      });

      navigate.navigate('ProductDetail', {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        description: 'Delicious pizza with fresh ingredients...',
        rating: product.rating,
        reviewCount: product.reviewCount,
        deliveryTime: '20 - 30min',
        freeDelivery: true
      });

      
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  }

  return (
    <View className="flex-1 bg-white relative">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-4 py-3 w-full absolute top-[30px] z-20">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-white">Menu Detail</Text>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center" onPress={handleToggleFavorite} >
            <Ionicons name="heart-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View className=" mb-6 relative">
          <Image
            source={{ uri: product.image }}
            className="w-full h-[300px] rounded-2xl"
            resizeMode="cover"
          />
          <View className='bg-black w-full h-[300px] absolute opacity-20' >

          </View>
          <View className="flex-row justify-center mt-4 space-x-2">
            <View className="w-8 h-1 bg-gray-300 rounded-full" />
            <View className="w-2 h-1 bg-gray-300 rounded-full" />
          </View>
        </View>

        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {product.name}
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </Text>
          </View>

          <View className="w-full flex-row items-center gap-5 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="bicycle-outline" size={18} color="#666" />
              <Text className="text-gray-600 ml-2">Free Delivery</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={18} color="#666" />
              <Text className="text-gray-600 ml-2">{product.deliveryTime}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={18} color="#FFA500" />
              <Text className="text-gray-600 ml-2">{product.rating}</Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-2">Description</Text>
            <Text className="text-gray-600 leading-6">
              {product.description}
              <Text className="text-orange font-medium"> Read More...</Text>
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Reviews ({product.reviewCount})
            </Text>
            <TouchableOpacity>
              <Text className="text-orange font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row">
              <View className="flex-1">
                <Text className="text-4xl font-bold text-gray-900 mb-2">
                  {product.rating}
                </Text>
                <View className="flex-row mb-2">
                  {renderStars(product.rating)}
                </View>
                <Text className="text-gray-600 text-sm">
                  Based on {product.reviewCount} reviews
                </Text>
              </View>
              
              <View className="flex-1 ml-6">
                {renderRatingBars()}
              </View>
            </View>
          </View>

          {reviews.map((review) => (
            <View key={review.id} className="flex-row mb-4 pb-4 border-b border-gray-100">
              <Image
                source={{ uri: review.userImage }}
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-semibold text-gray-900">
                    {review.userName}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#FFA500" />
                    <Text className="text-gray-600 ml-1 text-sm">
                      {review.rating}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm leading-5">
                  {review.comment}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="bg-white border-t border-gray-100 px-4 py-4 pb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-gray-100 rounded-full">
            <TouchableOpacity
              onPress={() => handleQuantityChange(false)}
              className="w-12 h-12 items-center justify-center"
              disabled={quantity <= 1}
            >
              <Ionicons 
                name="remove" 
                size={20} 
                color={quantity <= 1 ? "#ccc" : "#333"} 
              />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900 mx-4 min-w-[20px] text-center">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => handleQuantityChange(true)}
              className="w-12 h-12 items-center justify-center"
            >
              <Ionicons name="add" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-orange rounded-full px-8 py-4 flex-row items-center flex-1 ml-4 justify-center"
            style={{ opacity: isAddingToCart ? 0.7 : 1 }}
          >
            <Ionicons name="bag-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-lg">
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProductDetail;
