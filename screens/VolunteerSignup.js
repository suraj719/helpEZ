import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { firestore } from '../utils/firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const VolunteerSignup = () => {
  const { t } = useTranslation();
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [otherSkills, setOtherSkills] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [assignedRole, setAssignedRole] = useState("");
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const skills = {
    Medical: ["First Aid", "CPR", "Nursing", "Paramedic Skills", "Mental Health Support", "Medical Equipment Operation", "Triage"],
    SearchAndRescue: ["Search and Rescue Operations", "Rope and Knot Tying", "Water Rescue", "Climbing and Rappelling", "Navigation and Map Reading", "Disaster Site Management"],
    Technical: ["Emergency Communication Systems", "Radio Operation (HAM, VHF, etc.)", "GIS Mapping and Analysis", "Drone Operation", "IT Support for Emergency Operations", "Data Collection and Reporting"],
    Logistics: ["Supply Chain Management", "Inventory Management", "Transportation Logistics", "Shelter Management", "Food Distribution", "Volunteer Coordination"],
    Construction: ["Structural Engineering", "Electrical Repairs", "Plumbing Repairs", "Heavy Machinery Operation", "Debris Removal", "Temporary Housing Construction"],
    General: ["Cooking and Meal Preparation", "Language Translation", "Childcare", "Elderly Care", "Community Outreach", "Legal Assistance"],
  };

  const notificationListener = useRef();
  const responseListener = useRef();

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

  const assignRole = async (selectedIncident, selectedSkills) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'incidentCategories'));
      const incidentCategories = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const incidentCategory = incidentCategories.find(inc => inc.title === selectedIncident)?.category || '';

      const roleMappings = {
        Medical: "Medical Team Volunteer",
        SearchAndRescue: "Rescue Team Volunteer",
        Technical: "Tech Support Volunteer",
        Logistics: "Logistics Coordinator",
        Construction: "Construction Crew Volunteer",
        General: "Support Volunteer",
      };

      let selectedCategory = '';
      Object.keys(skills).forEach(category => {
        if (skills[category].some(skill => selectedSkills.includes(skill))) {
          selectedCategory = category;
        }
      });

      const role = roleMappings[selectedCategory] || roleMappings[incidentCategory] || 'General Support Volunteer';
      return role;
    } catch (error) {
      console.error('Error assigning role:', error);
      return 'General Support Volunteer';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedIncident || !age || !location || selectedSkills.length === 0) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      const role = await assignRole(selectedIncident, selectedSkills);

      { console.log(selectedSkills); }

      console.log('Assigned Role:', role);

      setAssignedRole(role);

      await addDoc(collection(firestore, "volunteers"), {
        selectedIncident,
        age,
        location,
        skills: selectedSkills.join(", "),
        name,
        phoneNumber,
        role
      });

      Alert.alert('Success', 'Volunteer details submitted successfully');

      const notificationContent = {
        title: t('Role Updated!'),
        body: `${t('Name')}: ${name}\n${t('Role')}: ${role}\n${t('Incident')}: ${selectedIncident}`,
        data: { name, age, incident: selectedIncident },
      };

      await schedulePushNotification(notificationContent);

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
          role: role
        });

        console.log('User details updated successfully');
        Alert.alert(t('Success'), t('User details updated successfully'));
      } else {
        console.error('User document not found');
        Alert.alert(t('Error'), t('User document not found'));
      }
    } catch (error) {
      console.error('Error submitting volunteer details:', error);
      Alert.alert(t('Error'), t('Failed to submit volunteer details'));
    }
  };

  async function schedulePushNotification(content) {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: { seconds: 1 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert(t('Failed to get push token for push notification!'));
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert(t('Must use physical device for Push Notifications'));
    }

    return token;
  }

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

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Volunteer Signup</Text>

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
        <Text style={styles.label}>Incident:</Text>
        <Picker
          selectedValue={selectedIncident}
          onValueChange={(itemValue) => setSelectedIncident(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select an incident" value="" />
          {incidents.map(incident => (
            <Picker.Item key={incident.id} label={incident.title} value={incident.title} />
          ))}
        </Picker>
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

      <View style={styles.formGroup}>
        <Text style={styles.label}>Skills:</Text>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search skills"
        />
        <View style={styles.skillsContainer}>
          {skills[selectedCategory] &&
            skills[selectedCategory]
              .filter(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(skill => (
                <TouchableOpacity
                  key={skill}
                  onPress={() => handleSkillChange(skill)}
                  style={[
                    styles.skillButton,
                    selectedSkills.includes(skill) && styles.selectedSkillButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.skillButtonText,
                      selectedSkills.includes(skill) && styles.selectedSkillButtonText,
                    ]}
                  >
                    {skill}
                  </Text>
                </TouchableOpacity>
              ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Other Skills:</Text>
        <TextInput
          style={styles.input}
          value={otherSkills}
          onChangeText={setOtherSkills}
          placeholder="Enter other skills"
        />
      </View>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    padding: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillButton: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 5,
    padding: 5,
    margin: 5,
  },
  skillButtonText: {
    color: '#007bff',
  },
  selectedSkillButton: {
    backgroundColor: '#007bff',
  },
  selectedSkillButtonText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#28a745',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VolunteerSignup;
