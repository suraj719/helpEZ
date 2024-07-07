import { Picker } from "@react-native-picker/picker";
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

const VolunteerSignup = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [skillsDetails, setSkillsDetails] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [otherSkills, setOtherSkills] = useState("");

  const technicalSkills = ["JavaScript", "React", "Node.js", "Python", "Java"];
  const nonTechnicalSkills = ["Communication", "Teamwork", "Project Management", "Leadership", "Problem Solving"];

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

  const handleSubmit = async () => {
    console.log("Form submitted:", { name, age, location, skills, skillsDetails, otherSkills });

    try {
      await addDoc(collection(db, "volunteers"), {
        name,
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

  const handleTagPress = (tag) => {
    if (!selectedSkills.includes(tag)) {
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

        <TextInput
          style={styles.input}
          placeholder="Incident"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={(text) => setAge(text)}
          keyboardType="numeric"
        />
        <View style={styles.locationContainer}>
          <TextInput
            style={styles.locationInput}
            placeholder="Location"
            value={location}
            onChangeText={(text) => setLocation(text)}
            editable={false}
          />
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
    borderColor: "#007bff",
    borderRadius: 6,
    backgroundColor: "#e7f1ff",
    marginRight: 10,
    marginBottom: 10,
  },
  tagInput: {
    backgroundColor: "transparent",
    borderColor: "#ccc",
  },
  selectedTag: {
    backgroundColor: "#007bff",
  },
  tagText: {
    color: "#007bff",
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
    backgroundColor: "#007bff",
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 10,
  },
  locationInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
  },
  locationIcon: {
    padding: 10,
  },
});

export default VolunteerSignup;
