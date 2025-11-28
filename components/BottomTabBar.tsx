import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

interface BottomTabBarProps {
  activeTab: string;
}

import { House, FileText, Heart, User, ShoppingCart } from 'lucide-react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'App';



export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
}) => {
  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View className="bg-white border-t border-gray-200 h-24">
      <View className="flex-row justify-center gap-14 items-center">
          <TouchableOpacity
            onPress={() => navigate.navigate('Dashboard')}
            className=" items-center py-3"
          >
            <House color={`${activeTab === 'Home'?'#EF6820':'black'}`} />
            <Text 
              className={`text-xs ${
                activeTab === "Home"
                  ? 'text-orange ' 
                  : 'text-gray-400'
              }`}
            >
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate.navigate('Checkout')}
            className=" items-center py-3"
          >
            <ShoppingCart color={`${activeTab === 'Checkout'?'#EF6820':'black'}`} />
            <Text 
              className={`text-xs ${
                activeTab === "Checkout"
                  ? 'text-orange ' 
                  : 'text-gray-400'
              }`}
            >
              Checkout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate.navigate('Order')}
            className=" items-center py-3"
          >
            <FileText color={`${activeTab === 'Order'?'#EF6820':'black'}`} />
            <Text 
              className={`text-xs ${
                activeTab === "Order"
                  ? 'text-orange ' 
                  : 'text-gray-400'
              }`}
            >
              My Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigate.navigate('Setting')}
            className=" items-center py-3"
          >
            <User color={`${activeTab === 'Profile'?'#EF6820':'black'}`} />
            <Text 
              className={`text-xs ${
                activeTab === "Profile"
                  ? 'text-orange ' 
                  : 'text-gray-400'
              }`}
            >
              Profile
            </Text>
          </TouchableOpacity>
      </View>
      <View className="h-1 bg-black mx-auto w-32 rounded-t-full mt-5" />
    </View>
  );
};