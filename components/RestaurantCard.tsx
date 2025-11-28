import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { MenuItem } from '../types';

interface RestaurantCardProps {
  item: MenuItem;
  onPress: () => void;
  showDiscount?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ 
  item, 
  onPress, 
  showDiscount = true 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full h-32"
        />
        {item.discount && showDiscount && (
          <View className="absolute top-2 left-2 bg-orange px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">
              {item.discount}% Off
            </Text>
          </View>
        )}
        <TouchableOpacity className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center">
          <Text className="text-gray-400">♡</Text>
        </TouchableOpacity>
      </View>
      
      <View className="p-3">
        <Text 
          className="text-lg font-semibold text-gray-900 mb-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
        
        <View className="flex-row items-center mb-2">
          <View className="flex-row items-center mr-4">
            <Text className="text-gray-500 text-sm mr-1">⏱</Text>
            <Text className="text-gray-500 text-sm">
              {item.deliveryTime} • {item.distance}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Text className="text-yellow-400 mr-1">⭐</Text>
            <Text className="text-gray-700 text-sm">
              {item.rating} ({item.reviewCount} Reviews)
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};