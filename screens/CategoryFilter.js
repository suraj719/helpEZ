// CategoryFilter.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const categories = [
  'All', 'Incident', 'Experience', 'Request', 'Severity'
];

const CategoryFilter = ({ onSelectCategory }) => {
  const handleCategoryPress = (category) => {
    onSelectCategory(category === 'All' ? null : category);
  };

  return (
    <View style={styles.container}>
      {categories.map(category => (
        <TouchableOpacity
          key={category}
          onPress={() => handleCategoryPress(category)}
          style={styles.categoryButton}
        >
          <Text style={styles.categoryText}>{category}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  categoryButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  categoryText: {
    fontSize: 16,
    color: '#333333',
  },
});

export default CategoryFilter;
