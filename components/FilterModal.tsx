import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X } from 'lucide-react-native';

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  paymentType: 'now' | 'delivery';
  starRating: number[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}

const { width } = Dimensions.get('window');

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApplyFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [currentPrice, setCurrentPrice] = useState(500);

  const popularFilters = [
    'Pizza',
    'Hamburgers',
    'Meat Church',
    'Pastry',
    'Cookies',
  ];

  const ratings = [1, 2, 3, 4, 5];

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
      setCurrentPrice(filters.priceRange[1]);
    }
  }, [visible, filters]);

  const handleCategoryToggle = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleRatingToggle = (rating: number) => {
    setLocalFilters(prev => ({
      ...prev,
      starRating: prev.starRating.includes(rating)
        ? prev.starRating.filter(r => r !== rating)
        : [...prev.starRating, rating],
    }));
  };

  const handleApplyFilters = () => {
    const finalFilters = {
      ...localFilters,
      priceRange: [localFilters.priceRange[0], currentPrice] as [number, number],
    };
    onApplyFilters(finalFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      priceRange: [10, 500] as [number, number],
      categories: [],
      paymentType: 'now' as const,
      starRating: [],
    };
    setLocalFilters(clearedFilters);
    setCurrentPrice(500);
  };

  const CustomSlider = () => {
    const [sliderValue, setSliderValue] = useState(currentPrice);
    const sliderWidth = width - 80; 
    const minValue = 10;
    const maxValue = 500;

    const handleSliderMove = (evt: any) => {
      const { locationX } = evt.nativeEvent;
      const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
      const value = minValue + (maxValue - minValue) * percentage;
      const roundedValue = Math.round(value);
      setSliderValue(roundedValue);
      setCurrentPrice(roundedValue);
    };

    const sliderPosition = ((sliderValue - minValue) / (maxValue - minValue)) * sliderWidth;

    return (
      <View className="py-4">
        <View 
          className="relative h-2 bg-gray-200 rounded-full"
          style={{ width: sliderWidth }}
          onTouchStart={handleSliderMove}
          onTouchMove={handleSliderMove}
        >
          <View 
            className="absolute h-2 bg-orange rounded-full"
            style={{ width: sliderPosition }}
          />
          
          <View 
            className="absolute w-5 h-5 bg-orange rounded-full -mt-1.5 shadow-lg"
            style={{ left: sliderPosition - 10 }}
          />
        </View>
        
        <Text className="text-center mt-2 text-gray-700 font-medium">
          ${sliderValue}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 mt-2">
          <TouchableOpacity onPress={onClose} className="p-1">
            <X size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Filter</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-6">Price Range</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 font-medium">$10</Text>
              <Text className="text-gray-600 font-medium">$500+</Text>
            </View>
            
            <View className="items-center">
              <CustomSlider />
            </View>
          </View>

          <View className="px-6 py-6 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-6">Popular Filters</Text>
            
            <View className="flex-row flex-wrap gap-3">
              {popularFilters.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => handleCategoryToggle(category)}
                  className={`px-4 py-3 rounded-full border ${
                    localFilters.categories.includes(category)
                      ? 'border-orange bg-orange-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      localFilters.categories.includes(category)
                        ? 'text-orange'
                        : 'text-gray-700'
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="px-6 py-6 border-b border-gray-100">
            <Text className="text-lg font-semibold text-gray-900 mb-6">Payment Type</Text>
            
            <TouchableOpacity
              onPress={() => setLocalFilters(prev => ({ ...prev, paymentType: 'now' }))}
              className="flex-row items-center mb-6"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                  localFilters.paymentType === 'now'
                    ? 'border-orange'
                    : 'border-gray-300'
                }`}
              >
                {localFilters.paymentType === 'now' && (
                  <View className="w-3 h-3 bg-orange rounded-full" />
                )}
              </View>
              <Text className="text-gray-900 font-medium text-base">Pay now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setLocalFilters(prev => ({ ...prev, paymentType: 'delivery' }))}
              className="flex-row items-center"
            >
              <View
                className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                  localFilters.paymentType === 'delivery'
                    ? 'border-orange'
                    : 'border-gray-300'
                }`}
              >
                {localFilters.paymentType === 'delivery' && (
                  <View className="w-3 h-3 bg-orange rounded-full" />
                )}
              </View>
              <Text className="text-gray-900 font-medium text-base">Pay on delivery</Text>
            </TouchableOpacity>
          </View>

          <View className="px-6 py-6 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-6">Star Rating</Text>
            
            <View className="flex-row justify-between">
              {ratings.map((rating) => (
                <TouchableOpacity
                  key={rating}
                  onPress={() => handleRatingToggle(rating)}
                  className={`px-4 py-3 rounded-xl border items-center ${
                    localFilters.starRating.includes(rating)
                      ? 'border-orange bg-orange-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                  style={{ minWidth: 60 }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-lg font-semibold mr-1">{rating}</Text>
                    <Text className="text-lg">⭐</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View className="px-6 py-6 border-t border-gray-100 bg-white">
          <TouchableOpacity
            onPress={handleApplyFilters}
            className="bg-orange rounded-2xl py-4 mb-4"
            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Apply Filter
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleClearAll}
            className="border-2 border-orange rounded-2xl py-4"
          >
            <Text className="text-orange text-center font-semibold text-lg">
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export { FilterModal };