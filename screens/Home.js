import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const emergencyContacts = [
  {
    name: 'Contact 1',
    phoneNumber: '917013399629'
  }
];

const sendEmergencySMS = async () => {
  const template_id = '66844ed5d6fc056b3520d952'; // Replace with your template ID
  const short_url = '1'; // 1 for On, 0 for Off
  const realTimeResponse = '1'; // Optional, set to '1' if needed
  const recipients = emergencyContacts.map(contact => ({
    mobiles: "917013399629",
    VAR1: 'VALUE 1', // Replace with your actual variables
    VAR2: 'VALUE 2' // Replace with your actual variables
  }));

  try {
    const response = await axios.post('http://192.168.0.112:3000/send-sms', {
      template_id,
      short_url,
      realTimeResponse,
      recipients
    });

    if (response.status === 200) {
      Alert.alert('Success', 'Emergency SMS sent successfully.');
    } else {
      Alert.alert('Error', 'Failed to send Emergency SMS.');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    Alert.alert('Error', 'Failed to send Emergency SMS.');
  }
};

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.homeText}>Home</Text>
      <Button title="Emergency SOS" onPress={sendEmergencySMS} color="#FF0000" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  homeText: {
    color: 'red',
    fontSize: 24,
    marginBottom: 20,
  },
});
