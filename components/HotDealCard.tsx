import React from 'react';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { MenuItem } from '../types';

interface HotDealCardProps {
  item: MenuItem;
  onPress: () => void;
}

export const HotDealCard: React.FC<HotDealCardProps> = ({ item, onPress }) => {
  return (
    <View className="bg-white rounded-2xl shadow-sm mb-3 overflow-hidden" onTouchEnd={onPress}>
      <View className="flex-row">
        <Image
          source={{ uri: item.image }}
          className="w-20 h-20 rounded-l-2xl"
        />
        
        <View className="flex-1 p-3 justify-between">
          <View>
            <Text className="text-base font-semibold text-gray-900 mb-1">
              {item.name}
            </Text>
            
            <View className="flex-row items-center mb-1">
              <Text className="text-gray-500 text-xs mr-1">⏱</Text>
              <Text className="text-gray-500 text-xs">
                {item.deliveryTime} • {item.distance}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <Text className="text-yellow-400 mr-1 text-xs">⭐</Text>
              <Text className="text-gray-600 text-xs">
                {item.rating} ({item.reviewCount} Reviews)
              </Text>
            </View>
          </View>
        </View>
        
        <View className="p-3 justify-between items-end">
          <Text className="text-lg font-bold text-gray-900">
            ${item.price.toFixed(2)}
          </Text>
          <TouchableOpacity 
            onPress={onPress}
            className="bg-orange px-3 py-1 rounded-full"
          >
            <Text className="text-white text-sm font-medium">+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};