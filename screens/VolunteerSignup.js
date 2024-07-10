import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { firestore } from '../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VolunteerSignup = () => {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [skillsDetails, setSkillsDetails] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [otherSkills, setOtherSkills] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");

  const technicalSkills = ["JavaScript", "React", "Node.js", "Python", "Java"];
  const nonTechnicalSkills = ["Communication", "Teamwork", "Project Management", "Leadership", "Problem Solving"];

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedName = await AsyncStorage.getItem("name");
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
        if (storedName) {
          setName(storedName);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'incidents'));
        const incidentsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncidents(incidentsList);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, []);
  const assignRole = (incident, skills) => {
    // Example role assignment logic
    if (incident.includes('Fire') && skills.includes('Leadership')) {
      return 'Fire Response Leader';
    } else if (incident.includes('Flood') && skills.includes('Teamwork')) {
      return 'Flood Relief Coordinator';
    } else if (incident.includes('Earthquake') && skills.includes('Project Management')) {
      return 'Earthquake Relief Manager';
    } else {
      return 'General Volunteer';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedIncident || !age || !location || !skills || selectedSkills.length === 0) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }
  
      // Assign role based on selected incident and skills
      const role = assignRole(selectedIncident, selectedSkills);
  
      // Log the role to verify before proceeding
      console.log('Assigned Role:', role);
  
      // Add volunteer details to Firestore
      await addDoc(collection(firestore, "volunteers"), {
        selectedIncident,
        age,
        location,
        skills,
        skillsDetails: [...selectedSkills, otherSkills].join(", "),
        name,
        phoneNumber,
        role
      });
  
      Alert.alert('Success', 'Volunteer details submitted successfully');
  
      // Update 'users' collection to set isVolunteer to true for this user
      const userQuerySnapshot = await getDocs(collection(firestore, 'users'));
  
      userQuerySnapshot.forEach(doc => {
        console.log('User Document Data:', doc.data());
      });
  
      const userDocId = userQuerySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber)?.id;
  
      console.log('User Document ID:', userDocId);
  
      if (userDocId) {
        const userRef = doc(firestore, 'users', userDocId);
        await updateDoc(userRef, {
          isVolunteer: true,
          role: role  // Ensure role is included here
        });
  
        console.log('User details updated successfully');
        Alert.alert('Success', 'User details updated successfully');
      } else {
        console.error('User document not found');
        Alert.alert('Error', 'User document not found');
      }
    } catch (error) {
      console.error('Error submitting volunteer details:', error);
      Alert.alert('Error', 'Failed to submit volunteer details');
    }
  };
  
  

  const handleLocationFetch = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
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
        console.warn('No address components found');
        Alert.alert('Location Not Found', 'Unable to fetch location details');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert('Error', 'Failed to fetch location details');
    }
  };

  const handleTagPress = (tag) => {
    if (selectedSkills.includes(tag)) {
      handleTagRemove(tag);
    } else {
      setSelectedSkills([...selectedSkills, tag]);
    }
  };

  const handleTagRemove = (tag) => {
    setSelectedSkills(selectedSkills.filter((skill) => skill !== tag));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Volunteer Signup Page</Text>

        <Text style={styles.userInfo}>Name: {name}</Text>
        <Text style={styles.userInfo}>Phone Number: {phoneNumber}</Text>

        <Picker
          selectedValue={selectedIncident}
          style={styles.input}
          onValueChange={(itemValue) => setSelectedIncident(itemValue)}
        >
          <Picker.Item label="Select Incident" value="" />
          {incidents.map((incident) => (
            <Picker.Item key={incident.id} label={incident.title} value={incident.title} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={(text) => setAge(text)}
          keyboardType="numeric"
        />
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>{location}</Text>
          <TouchableOpacity onPress={handleLocationFetch} style={styles.locationIcon}>
            <MaterialIcons name="my-location" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Skills:</Text>
        <Picker
          selectedValue={skills}
          style={styles.picker}
          onValueChange={(itemValue) => setSkills(itemValue)}
        >
          <Picker.Item label="Select Skills" value="" />
          <Picker.Item label="Technical" value="technical" />
          <Picker.Item label="Non-Technical" value="non-technical" />
        </Picker>

        {skills !== "" && (
          <View>
            <Text style={styles.label}>Select {skills} skills:</Text>
            <View style={styles.tagContainer}>
              {(skills === "technical" ? technicalSkills : nonTechnicalSkills).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tag, selectedSkills.includes(tag) && styles.selectedTag]}
                  onPress={() => handleTagPress(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={[styles.tag, styles.tagInput]}
                placeholder="Add other skills"
                value={otherSkills}
                onChangeText={(text) => setOtherSkills(text)}
                onSubmitEditing={() => {
                  if (otherSkills.trim()) {
                    handleTagPress(otherSkills.trim());
                    setOtherSkills("");
                  }
                }}
              />
            </View>
          </View>
        )}

        <View style={styles.selectedSkillsContainer}>
          {selectedSkills.map((tag) => (
            <View key={tag} style={styles.selectedTagContainer}>
              <TouchableOpacity style={styles.selectedTag} onPress={() => handleTagRemove(tag)}>
                <Text style={styles.selectedTagText}>{tag}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 20,
  },
  formContainer: {
    width: "90%",
    backgroundColor: "#333", // Darkened background color for better contrast
    padding: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  userInfo: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 16,
    marginBottom: 10,
    color: "#000",
    backgroundColor: "#fff",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 6,
    marginBottom: 10,
    color: "#000",
    backgroundColor: "#fff",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tag: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 6,
    backgroundColor: "#000",
    marginRight: 10,
    marginBottom: 10,
  },
  tagInput: {
    backgroundColor: "#fff",
    borderColor: "#fff",
    color: "#000",
  },
  tagText: {
    color: "#fff",
  },
  selectedSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    marginTop: 10,
  },
  selectedTagContainer: {
    marginRight: 10,
    marginBottom: 10,
  },
  selectedTag: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#DCDCDC",
    borderWidth: 1,
    borderColor: "#000",
  },
  selectedTagText: {
    color: "#000",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationText: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  locationIcon: {
    marginLeft: 10,
  },
});

export default VolunteerSignup;
