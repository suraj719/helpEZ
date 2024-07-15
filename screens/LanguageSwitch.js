import React, { forwardRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const LanguageSwitch = forwardRef(({ switchLanguage, selectedLanguage }, ref) => {
  
  return (
    <View style={styles.languageSwitch}>
      <TouchableOpacity 
        onPress={() => switchLanguage('en')}
        style={[
          styles.languageButton,
          selectedLanguage === 'en' && styles.languageButtonSelected
        ]}
      >
        <Text style={[
          styles.languageButtonText,
          selectedLanguage === 'en' && styles.languageButtonTextSelected
        ]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => switchLanguage('hi')}
        style={[
          styles.languageButton,
          selectedLanguage === 'hi' && styles.languageButtonSelected
        ]}
      >
        <Text style={[
          styles.languageButtonText,
          selectedLanguage === 'hi' && styles.languageButtonTextSelected
        ]}>HI</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 4,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  languageButtonSelected: {
    backgroundColor: '#007bff',
  },
  languageButtonText: {
    color: '#000',
    fontSize: 16,
  },
  languageButtonTextSelected: {
    color: '#fff',
  },
});

export default LanguageSwitch;
