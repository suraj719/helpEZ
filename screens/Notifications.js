import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';  // Import the Ionicons

export default function Notifications() {
  const navigation = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);

    // Fetch incidents from Firestore
    const snapshot = await getDocs(collection(db, "incidents"));
    const data = snapshot.docs.map((doc) => {
      const vals = doc.data();
      const id = doc.id;
      return { id, ...vals };
    });

    // Fetch removed incidents from AsyncStorage
    const removedIncidents = JSON.parse(await AsyncStorage.getItem('removedIncidents')) || [];

    // Filter out removed incidents
    const filteredData = data.filter(incident => !removedIncidents.includes(incident.id));

    setIncidents(filteredData);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [])
  );

  useEffect(() => {
    fetchIncidents();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchIncidents();
      setRefreshing(false);
    }, 1000);
  }, []);

  const removeIncidentFromState = async (id) => {
    setIncidents((prevIncidents) => prevIncidents.filter((incident) => incident.id !== id));

    // Update AsyncStorage with the removed incident ID
    const removedIncidents = JSON.parse(await AsyncStorage.getItem('removedIncidents')) || [];
    removedIncidents.push(id);
    await AsyncStorage.setItem('removedIncidents', JSON.stringify(removedIncidents));
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <TouchableOpacity
        style={styles.removeIconContainer}
        onPress={() => removeIncidentFromState(item.id)}
      >
        <Icon name="close-circle" size={20} color="#6c757d" />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("IncidentDetails", { incident: item })}
      >
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>Check incidents to know more.</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : incidents.length === 0 ? (
        <View style={styles.noIncidentsContainer}>
          <Text style={styles.noIncidentsText}>
            No incidents reported till now.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={incidents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.notificationsList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noIncidentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noIncidentsText: {
    fontSize: 16,
    color: '#6c757d',
  },
  notificationsList: {
    padding: 8,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',  // Add position relative to contain the absolute position of the icon
  },
  removeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#343a40',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 5,
  },
});
