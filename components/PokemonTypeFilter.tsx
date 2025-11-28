import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface PokemonType {
  id: number;
  name: string;
  url: string;
}

interface TypeFilterProps {
  types: PokemonType[];
  selectedType: string | null;
  onTypeSelect: (typeName: string | null) => void;
  loading?: boolean;
}

const typeColors: { [key: string]: string } = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const PokemonTypeFilter: React.FC<TypeFilterProps> = ({
  types,
  selectedType,
  onTypeSelect,
  loading = false,
}) => {
  const getTypeColor = (typeName: string) => {
    return typeColors[typeName.toLowerCase()] || '#68A090';
  };

  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <View className="px-4 mb-4">
        <Text className="text-sm text-gray-500">Carregando tipos...</Text>
      </View>
    );
  }

  return (
    <View className="px-4 mb-4">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Filtrar por Tipo
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          <TouchableOpacity
            onPress={() => onTypeSelect(null)}
            className={`mr-3 px-4 py-2 rounded-full border-2 ${
              selectedType === null
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedType === null ? 'text-white' : 'text-gray-700'
              }`}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {types.map((type) => {
            const isSelected = selectedType === type.name;
            const backgroundColor = getTypeColor(type.name);
            
            return (
              <TouchableOpacity
                key={type.id}
                onPress={() => onTypeSelect(type.name)}
                style={{
                  backgroundColor: isSelected ? backgroundColor : '#FFFFFF',
                  borderColor: backgroundColor,
                }}
                className={`mr-3 px-4 py-2 rounded-full border-2 shadow-sm`}
              >
                <Text
                  className={`font-medium ${
                    isSelected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {capitalizeFirst(type.name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};