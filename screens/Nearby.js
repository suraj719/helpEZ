import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../utils/firebase'; // Adjust the import path as per your project structure


export default function Nearby() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [randomMarkers, setRandomMarkers] = useState([]);
  const [showRandomMarkers, setShowRandomMarkers] = useState(false);
  const [volunteerMarkers, setVolunteerMarkers] = useState([]);
  const [showVolunteerMarkers, setShowVolunteerMarkers] = useState(false); // State for showing volunteer markers

  const mapRef = useRef(null);
  const usersCollection = collection(firestore, 'users');

  useEffect(() => {
    async function getLocationAsync() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCurrentLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }

    getLocationAsync();
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setCurrentLocation({ latitude, longitude });
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const fetchNearbyPlaces = async (type) => {
    if (!currentLocation) {
      Alert.alert('Location not available', 'Please try again later');
      return [];
    }

    try {
      const { latitude, longitude } = currentLocation;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=${type}&key=AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc`
      );

      return response.data.results.map(place => ({
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        title: place.name,
        description: place.vicinity,
      }));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby places');
      return [];
    }
  };

  const toggleRandomMarkers = async () => {
    if (showRandomMarkers) {
      setShowRandomMarkers(false);
      setRandomMarkers([]);
      setNearbyPlaces([]);
    } else {
      const randomLocations = [
        { latitude: 17.385044, longitude: 78.486671, title: 'Random Location 1' },
        { latitude: 17.391044, longitude: 78.486671, title: 'Random Location 2' },
        { latitude: 17.385044, longitude: 78.491671, title: 'Random Location 3' },
        { latitude: 17.380044, longitude: 78.481671, title: 'Random Location 4' },
      ];

      const shelters = await fetchNearbyPlaces('shelter');
      const stays = await fetchNearbyPlaces('lodging');

      setRandomMarkers(randomLocations);
      setNearbyPlaces([...shelters, ...stays]);
      setShowRandomMarkers(true);
      setShowNearbyPlaces(true);
    }
  };

  const toggleNearbyHospitals = async () => {
    if (showNearbyPlaces) {
      setShowNearbyPlaces(false);
      setNearbyPlaces([]);
    } else {
      const hospitals = await fetchNearbyPlaces('hospital');

      setNearbyPlaces(hospitals);
      setShowNearbyPlaces(true);
    }
  };

  const toggleNearbyMedicals = async () => {
    if (showNearbyPlaces) {
      setShowNearbyPlaces(false);
      setNearbyPlaces([]);
    } else {
      const pharmacies = await fetchNearbyPlaces('pharmacy');

      setNearbyPlaces(pharmacies);
      setShowNearbyPlaces(true);
    }
  };

  const toggleNearbyFood = async () => {
    if (showNearbyPlaces) {
      setShowNearbyPlaces(false);
      setNearbyPlaces([]);
      setShowRandomMarkers(false);
    } else {
      const hotels = await fetchNearbyPlaces('restaurant');
      const randomLocations = [
        { latitude: 17.385044, longitude: 78.486671, title: 'Food Location 1' },
        { latitude: 17.391044, longitude: 78.486671, title: 'Food Location 2' },
        { latitude: 17.385044, longitude: 78.491671, title: 'Food Location 3' },
        { latitude: 17.380044, longitude: 78.481671, title: 'Food Location 4' },
      ];

      setNearbyPlaces(hotels);
      setRandomMarkers(randomLocations);
      setShowNearbyPlaces(true);
      setShowRandomMarkers(true);
    }
  };

  const toggleNearbyPoliceStations = async () => {
    if (showNearbyPlaces) {
      setShowNearbyPlaces(false);
      setNearbyPlaces([]);
      setShowRandomMarkers(false);
    } else {
      const policeStations = await fetchNearbyPlaces('police');
      const randomLocations = [
        { latitude: 17.385044, longitude: 78.486671, title: 'Police 1' },
        { latitude: 17.380044, longitude: 78.481671, title: 'Police 2' },
      ];

      setNearbyPlaces(policeStations);
      setRandomMarkers(randomLocations);
      setShowNearbyPlaces(true);
      setShowRandomMarkers(true);
    }
  };

  const fetchVolunteerLocations = async () => {
    try {
      const volunteerSnapshot = await getDocs(query(usersCollection, where("isVolunteer", "==", true)));
      const volunteerLocations = volunteerSnapshot.docs.map(doc => ({
        latitude: doc.data().location.latitude,
        longitude: doc.data().location.longitude,
        title: doc.data().name,
      }));

      setVolunteerMarkers(volunteerLocations);
      setShowVolunteerMarkers(true);
    } catch (error) {
      console.error('Error fetching volunteer locations:', error);
      Alert.alert('Error', 'Failed to fetch volunteer locations');
    }
  };

  const toggleVolunteerMarkers = async () => {
    if (showVolunteerMarkers) {
      setShowVolunteerMarkers(false);
      setVolunteerMarkers([]);
    } else {
      await fetchVolunteerLocations();
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              description="You are here"
              pinColor="blue"
            />
          )}

          {showNearbyPlaces && nearbyPlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              title={place.title}
              description={place.description}
              pinColor="red"
            />
          ))}

          {showRandomMarkers && randomMarkers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              pinColor="green"
            />
          ))}

          {showVolunteerMarkers && nearbyPlaces.map((volunteer, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: volunteer.latitude,
                longitude: volunteer.longitude,
              }}
              title={volunteer.title}
              description="Volunteer Location"
              pinColor="orange"
            />
          ))}
        </MapView>
      )}
      <View style={[styles.getCurrentLocationButtonContainer, styles.bottomRight]}>
        <TouchableOpacity style={styles.circleButton} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.buttonContainer}
        contentContainerStyle={{ alignItems: 'center' }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleNearbyHospitals}>
          <Ionicons name="medkit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleNearbyMedicals}>
          <Ionicons name="medical" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleNearbyFood}>
          <Ionicons name="restaurant" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleNearbyPoliceStations}>
          <Ionicons name="shield" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleRandomMarkers}>
          <Ionicons name="pin" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rectangleButton} onPress={toggleVolunteerMarkers}>
          <Ionicons name="person-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  getCurrentLocationButtonContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    maxHeight: 100,
  },
  rectangleButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginHorizontal: 5,
  },
});
