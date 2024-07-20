// BottomNavBar.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';



const BottomNavBar = () => {
  const navigation = useNavigation();
const handlePress = () => {
  navigation.navigate("CreatePost"); // Navigate to the desired screen
};
  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="home" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="search" size={24} color="#6B6B6B" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={handlePress}>
        <Ionicons name="add-circle" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="notifications" size={24} color="#6B6B6B" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Ionicons name="person" size={24} color="#6B6B6B" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  navButton: {
    alignItems: 'center',
  },
});

export default BottomNavBar;
