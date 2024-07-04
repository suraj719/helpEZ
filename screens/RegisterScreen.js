import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { getFirestore, collection, addDoc, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [neededBy, setNeededBy] = useState('');

  const handleRegister = async () => {
    try {
      // Validate input fields
      if (!name || !description || !phone || !neededBy) {
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

      // Assume Firebase Firestore operations as per your previous implementation
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phone}
        onChangeText={(text) => setPhone(text)}
        keyboardType="phone-pad"
      />
      <Text style={styles.label}>Needed By (Date)</Text>
      <TextInput
        style={styles.input}
        placeholder="Needed By (Date)"
        value={neededBy}
        onChangeText={(text) => setNeededBy(text)}
      />
      <Button title="Submit" onPress={handleRegister} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  label: {
    marginBottom: 4,
    color: '#333',
  },
});

export default RegisterScreen;
