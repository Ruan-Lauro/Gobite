import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { CategoryProduct } from '../types';

interface CategoryButtonProps {
  category: CategoryProduct;
  isActive?: boolean;
  onPress: () => void;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  category, 
  isActive = false, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
        isActive 
          ? `bg-orange` 
          : 'bg-gray-100'
      }`}
    >
      <Text className={`text-2xl mr-2 ${isActive?'bg-white rounded-full':''}`}>{category.icon}</Text>
      <Text 
        className={`font-medium ${
          isActive ? 'text-white' : 'text-gray-700'
        }`}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};
