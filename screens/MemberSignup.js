import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { firestore } from '../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const MemberSignup = () => {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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
        Alert.alert('Validation Error', 'Please fill in all required fields');
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

      Alert.alert('Success', 'Member details submitted successfully');

      const userQuerySnapshot = await getDocs(collection(firestore, 'users'));

      userQuerySnapshot.forEach(doc => {
        console.log('User Document Data:', doc.data());
      });

      const userDocId = userQuerySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber)?.id;

      console.log('User Document ID:', userDocId);

      if (userDocId) {
        const userRef = doc(firestore, 'users', userDocId);
        await updateDoc(userRef, {
          isMember: true,
        });

        console.log('User details updated successfully');
        Alert.alert(t('Success'), t('User details updated successfully'));
        setIsRegistered(true);
      } else {
        console.error('User document not found');
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
      console.warn(t('Location permission denied'));
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
        console.warn(t('No address components found'));
        Alert.alert(t('Location Not Found'), t('Unable to fetch location details'));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Failed to fetch location');
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
    <Text style={styles.heading}>You are already registered as a member.</Text>
  </View>
</View>

    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Member Signup</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Password:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(password) => setPassword(password)}
          value={password}
          placeholder="Enter your password"
          secureTextEntry={true}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Age:</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Location:</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter your location"
          />
          <TouchableOpacity onPress={handleLocationFetch} style={styles.locationButton}>
            <MaterialIcons name="my-location" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category:</Text>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={handleCategoryChange}
          style={styles.picker}
        >
          <Picker.Item label="Select a category" value="" />
          {Object.keys(skills).map(category => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      {selectedCategory ? (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Skills:</Text>
    {skills[selectedCategory].map(skill => (
      <TouchableOpacity
        key={skill}
        style={[
          styles.skillButton,
          selectedSkills.includes(skill) && styles.skillButtonSelected,
        ]}
        onPress={() => handleSkillChange(skill)}
      >
        <Text
          style={[
            styles.skillButtonText,
            selectedSkills.includes(skill) && styles.skillButtonTextSelected,
          ]}
        >
          {skill}
        </Text>
      </TouchableOpacity>
    ))}
    <TextInput
      style={styles.input}
      value={otherSkills}
      onChangeText={setOtherSkills}
      placeholder="Enter other skills"
    />
  </View>
) : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', 
    padding: 20,
  },
  messageBox: {
    backgroundColor: '#ffffff', 
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40', 
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    marginLeft: 8,
    backgroundColor: '#007BFF',
    padding: 8,
    borderRadius: 4,
  },
  picker: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
  },
  skillButton: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
  },
  skillButtonSelected: {
    backgroundColor: '#007BFF',
  },
  skillButtonText: {
    textAlign: 'center',
  },
  skillButtonTextSelected: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MemberSignup;