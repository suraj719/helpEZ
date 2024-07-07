import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';

const MedicineInfoScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [medicineInfo, setMedicineInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMedicineInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.fda.gov/drug/label.json?search=${searchQuery}`);
      if (response.data.results.length > 0) {
        setMedicineInfo(response.data.results[0]);
      } else {
        setMedicineInfo(null);
      }
    } catch (error) {
      console.error('Error fetching medicine info:', error);
      // Handle error states here
    } finally {
      setLoading(false);
    }
  };

  const getMedicineName = () => {
    return medicineInfo && medicineInfo.openfda && medicineInfo.openfda.brand_name
      ? medicineInfo.openfda.brand_name
      : 'Medicine Name Not Available';
  };

  const getIndications = () => {
    return medicineInfo && medicineInfo.indications_and_usage
      ? medicineInfo.indications_and_usage
      : 'No information available';
  };

  const getWarnings = () => {
    if (medicineInfo && medicineInfo.warnings && medicineInfo.warnings.length > 0) {
      return medicineInfo.warnings.join('\n');
    }
    return 'No warnings available';
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter medicine name"
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />
      <Button title="Search" onPress={fetchMedicineInfo} disabled={!searchQuery} color="#000" />

      <ScrollView style={styles.scrollView}>
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
        ) : medicineInfo ? (
          <View style={styles.medicineInfoContainer}>
            <Text style={styles.medicineName}>{getMedicineName()}</Text>
            <Text style={styles.sectionTitle}>Indications and Usage:</Text>
            <Text style={styles.medicineDetails}>{getIndications()}</Text>
            <Text style={styles.sectionTitle}>Warnings:</Text>
            <Text style={styles.medicineDetails}>{getWarnings()}</Text>
            {/* Add more sections as needed */}
          </View>
        ) : (
          <Text style={styles.noResults}>No medicine information available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: '#000', // Text color
    fontSize: 16,
    borderRadius: 5,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
  medicineInfoContainer: {
    marginTop: 20,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000', // Text color
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#000', // Text color
  },
  medicineDetails: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000', // Text color
  },
  noResults: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    color: '#000', // Text color
  },
});

export default MedicineInfoScreen;
