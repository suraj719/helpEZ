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

export default function Notifications() {
  const navigation = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "incidents"));
    const data = snapshot.docs.map((doc) => {
      const vals = doc.data();
      const id = doc.id;
      return { id, ...vals };
    });
    setIncidents(data);
    setLoading(false);

    const incidentIds = snapshot.docs.map(doc => doc.id);
    await AsyncStorage.setItem('storedIncidents', JSON.stringify(incidentIds));
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

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("IncidentDetails", { incident: item })}
      style={styles.notificationItem}
    >
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationMessage}>Check incidents to know more.</Text>
    </TouchableOpacity>
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