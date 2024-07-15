import React, { useState } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

import Sp1Image from '../assets/images/Sp_1.png';
import Sp2Image from '../assets/images/Sp_3.png';

const cards = [
  {
    image: Sp1Image, 
    title: 'Everything is straight to the point',
    description: 'Determine your financial planning easily. Everything is right on track, no problem.',
  },
  {
    image: Sp2Image, 
    title: 'Stay on top of your goals',
    description: 'Track your progress and stay motivated. Your success is our priority.',
  },
];

export default function GalileoDesign() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf'),
    'NotoSans-Regular': require('../assets/fonts/NotoSans-VariableFont_wdth,wght.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleNext = () => {
    if (currentCardIndex === cards.length - 1) {
      navigation.navigate('Register');
    } else {
      setCurrentCardIndex(prevIndex => prevIndex + 1);
    }
  };

  const { image, title, description } = cards[currentCardIndex];

  //console.log('Current Image URL:', image); // Log current image URL for debugging

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageBackground source={image} style={styles.imageBackground} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <View style={styles.dotsContainer}>
          {cards.map((_, index) => (
            <View
              key={index}
              style={index === currentCardIndex ? styles.activeDot : styles.inactiveDot}
            />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{currentCardIndex === cards.length - 1 ? 'Register' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerSpace} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    minHeight: 80,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    height: 300,
  },
  title: {
    color: 'black',
    fontSize: 28,
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'left',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    lineHeight: 36,
  },
  description: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'NotoSans-Regular',
    textAlign: 'left',
    paddingHorizontal: 20,
    paddingBottom: 10,
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  activeDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: 'black',
  },
  inactiveDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: '#DEDEDE',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  footerSpace: {
    height: 20,
    backgroundColor: '#FFFFFF',
  },
});
