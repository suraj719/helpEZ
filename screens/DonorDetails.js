import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DonorDetails = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donor Details</Text>
      <Text style={styles.details}>
        Thank you for your interest in donating for future events. We appreciate your support!
      </Text>
      {/* Add more details or components as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  details: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default DonorDetails;
