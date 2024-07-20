import React, { useState, useEffect } from 'react';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { firestore } from '../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const MemberSignupScreen = () => {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [otherSkills, setOtherSkills] = useState("");

  const skills = {
    Medical: ["First Aid", "CPR", "Nursing", "Paramedic Skills", "Mental Health Support", "Medical Equipment Operation", "Triage"],
    SearchAndRescue: ["Search and Rescue Operations", "Rope and Knot Tying", "Water Rescue", "Climbing and Rappelling", "Navigation and Map Reading", "Disaster Site Management"],
    Technical: ["Emergency Communication Systems", "Radio Operation (HAM, VHF, etc.)", "GIS Mapping and Analysis", "Drone Operation", "IT Support for Emergency Operations", "Data Collection and Reporting"],
    Logistics: ["Supply Chain Management", "Inventory Management", "Transportation Logistics", "Shelter Management", "Food Distribution", "Volunteer Coordination"],
    Construction: ["Structural Engineering", "Electrical Repairs", "Plumbing Repairs", "Heavy Machinery Operation", "Debris Removal", "Temporary Housing Construction"],
    General: ["Cooking and Meal Preparation", "Language Translation", "Childcare", "Elderly Care", "Community Outreach", "Legal Assistance"],
  };

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedName = await AsyncStorage.getItem("name");
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
        if (storedName) {
          setName(storedName);
        }

        const userQuerySnapshot = await getDocs(collection(firestore, 'users'));
        const userDoc = userQuerySnapshot.docs.find(doc => doc.data().phoneNumber === storedPhoneNumber);
        
        if (userDoc && userDoc.data().isMember) {
          setIsRegistered(true);
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
      }
    };
    checkRegistrationStatus();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!age || !location || selectedSkills.length === 0) {
        Alert.alert(t('Validation Error'), t('Please fill in all required fields'));
        return;
      }

      await addDoc(collection(firestore, "MemberSignup"), {
        age,
        location,
        skills: [...selectedSkills, otherSkills].filter(Boolean).join(", "),
        name,
        phoneNumber,
        password,
      });

      Alert.alert(t('Success'), t('Member details submitted successfully'));

      const userQuerySnapshot = await getDocs(collection(firestore, 'users'));
      const userDocId = userQuerySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber)?.id;

      if (userDocId) {
        const userRef = doc(firestore, 'users', userDocId);
        await updateDoc(userRef, {
          isMember: true,
        });

        Alert.alert(t('Success'), t('User details updated successfully'));
        setIsRegistered(true);
      } else {
        Alert.alert(t('Error'), t('User document not found'));
      }
    } catch (error) {
      console.error('Error submitting Member details:', error);
      Alert.alert(t('Error'), t('Failed to submit Member details'));
    }
  };

  const handleLocationFetch = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('Location permission denied'));
      return;
    }

    try {
      let locationData = await Location.getCurrentPositionAsync({});
      let { latitude, longitude } = locationData.coords;
      setCurrentLocation({ latitude, longitude });

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc`
      );

      if (response.data.results.length > 0) {
        const addressComponents = response.data.results[0].address_components;
        let village = "";
        let state = "";

        for (let component of addressComponents) {
          if (component.types.includes('locality')) {
            village = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
        }

        let areaName = `${village}, ${state}`;
        setLocation(areaName);
      } else {
        Alert.alert(t('Location Not Found'), t('Unable to fetch location details'));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert(t('Error'), t('Failed to fetch location'));
    }
  };

  const handleSkillChange = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSkills([]);
  };

  if (isRegistered) {
    return (
      <View style={styles.container}>
        <View style={styles.messageBox}>
          <Text style={styles.heading}>{t('You are already registered as a member.')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Member Signup')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Name')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            editable={false}
            placeholder={t('Enter your name')}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Phone Number')}</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            editable={false}
            placeholder={t('Enter your phone number')}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Password')}</Text>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('Enter your password')}
              secureTextEntry
            />
            <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
              <FontAwesome5 name="eye" size={20} color="#007bff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Age')}</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder={t('Enter your age')}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Location')}</Text>
          <View style={styles.locationContainer}>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder={t('Enter your location')}
              editable={false}
            />
            <TouchableOpacity onPress={handleLocationFetch} style={styles.locationButton}>
              <MaterialIcons name="my-location" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('Category')}</Text>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={handleCategoryChange}
            style={styles.picker}
          >
            <Picker.Item label={t('Select a category')} value="" />
            {Object.keys(skills).map(category => (
              <Picker.Item key={category} label={category} value={category} />
            ))}
          </Picker>
        </View>

        {selectedCategory && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Skills')}</Text>
            <View style={styles.skillsContainer}>
              {skills[selectedCategory].map(skill => (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillButton, selectedSkills.includes(skill) && styles.selectedSkill]}
                  onPress={() => handleSkillChange(skill)}
                >
                  <Text style={styles.skillText}>{skill}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              value={otherSkills}
              onChangeText={setOtherSkills}
              placeholder={t('Other skills')}
            />
          </View>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t('Submit')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    marginLeft: 10,
    backgroundColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedSkill: {
    backgroundColor: '#007bff',
  },
  skillText: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: 'black',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  messageBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MemberSignupScreen;
