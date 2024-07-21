// Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Community</Text>
      <TouchableOpacity style={styles.searchButton}>
        <Ionicons name="search" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 24,
    height: 24,
  },
});

export default Header;
