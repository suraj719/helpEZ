import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { getFirestore, collection, addDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker

const ResourcesRequest = ({navigation}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [neededBy, setNeededBy] = useState(new Date()); // Initialize neededBy with current date/time
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control visibility of DateTimePicker

  const handleRegister = async () => {
    try {
      // Validate input fields
      if (!name || !description || !phone) {
        Toast.show({
          type: 'error',
          text1: 'All fields are required',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 90,
          position: 'top',
        });
        return;
      }

      // Validate phone number to contain only numbers
      if (!/^\d+$/.test(phone)) {
        Toast.show({
          type: 'error',
          text1: 'Phone Number should contain only numbers',
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 90,
          position: 'top',
        });
        return;
      }

      // Firebase Firestore operations as per your previous implementation
      const firestore = getFirestore();
      const requestsRef = doc(firestore, 'requests', 'globalRequests');
      const requestsSnap = await getDoc(requestsRef);

      if (requestsSnap.exists()) {
        await updateDoc(requestsRef, {
          registrations: [
            ...requestsSnap.data().registrations,
            {
              name,
              description,
              phone,
              neededBy,
            },
          ],
        });
      } else {
        await setDoc(requestsRef, {
          registrations: [{
            name,
            description,
            phone,
            neededBy,
          }],
        });
      }

      // Show success toast message
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 90,
        position: 'top',
      });

      // Navigate to Dashboard after successful registration
      navigation.navigate('Dashboard');
    } catch (e) {
      console.error('Error adding document: ', e);
      Toast.show({
        type: 'error',
        text1: 'Error adding document',
        visibilityTime: 3000,
        autoHide: true,
        topOffset: 90,
        position: 'top',
      });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || neededBy;
    setShowDatePicker(false);
    setNeededBy(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Describe your need"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your phone number"
          value={phone}
          onChangeText={(text) => setPhone(text)}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Needed By (Date)</Text>
        <TouchableOpacity style={styles.datePickerContainer} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerText}>{neededBy.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={neededBy}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#841584',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  button: {
    backgroundColor: '#841584',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  datePickerContainer: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ResourcesRequest;
