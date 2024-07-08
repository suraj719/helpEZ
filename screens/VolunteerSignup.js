import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import axios from 'axios';
import { firestore } from '../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
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
  const [phoneNumber, setPhoneNumber] = useState(""); // State for user's phone number
  const [name, setName] = useState(""); // State for user's name
  const [allAsyncStorageItems, setAllAsyncStorageItems] = useState([]);

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

  // Fetch incidents from Firestore
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

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Form submitted:", { selectedIncident, age, location, skills, skillsDetails, otherSkills });

    try {
      await addDoc(collection(firestore, "volunteers"), {
        selectedIncident,
        age,
        location,
        skills,
        skillsDetails: [...selectedSkills, otherSkills].join(", ")
      });
      Alert.alert('Success', 'Form submitted successfully');
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit form');
    }
  };

  // Function to handle location fetching
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_API_KEY`
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

  // Function to handle tag press and toggle selection/removal
  const handleTagPress = (tag) => {
    if (selectedSkills.includes(tag)) {
      handleTagRemove(tag);
    } else {
      setSelectedSkills([...selectedSkills, tag]);
    }
  };

  const handleTagRemove = (tag) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== tag));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Volunteer Signup Page</Text>

        {/* Display user's phone number and name */}
        <Text style={styles.userInfo}>Name: {name}</Text>
        <Text style={styles.userInfo}>Phone Number: {phoneNumber}</Text>

        {/* Dropdown for selecting incident */}
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
            <TouchableOpacity key={tag} style={styles.selectedTag} onPress={() => handleTagRemove(tag)}>
              <Text style={styles.selectedTagText}>{tag}</Text>
            </TouchableOpacity>
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
  },
  formContainer: {
    maxWidth: 400,
    backgroundColor: "#fff",
    padding: 32,
    fontSize: 14,
    fontFamily: "System",
    color: "#212121",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  tag: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 6,
    backgroundColor: "#a2a2a3",
    marginRight: 10,
    marginBottom: 10,
  },
  tagInput: {
    backgroundColor: "transparent",
    borderColor: "#ccc",
  },
  selectedTag: {
    backgroundColor: "#3f3f40",
  },
  tagText: {
    color: "#fff",
  },
  selectedTagText: {
    color: "#fff",
  },
  selectedSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
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
    borderColor: "#ccc",
    borderRadius: 6,
    height: 40,
    paddingHorizontal: 16,
  },
  locationIcon: {
    marginLeft: 10,
  },
});

export default VolunteerSignup;
