import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

export default function Nearby() {
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [randomMarkers, setRandomMarkers] = useState([]);
  const [showRandomMarkers, setShowRandomMarkers] = useState(false);

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
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const fetchNearbyPlaces = async () => {
    if (!currentLocation) {
      Alert.alert('Location not available', 'Please try again later');
      return;
    }

    if (showNearbyPlaces) {
      setShowNearbyPlaces(false);
      setNearbyPlaces([]);
      return;
    }

    try {
      const { latitude, longitude } = currentLocation;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=hospital&key=AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc`
      );

      setNearbyPlaces(response.data.results);
      setShowNearbyPlaces(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch nearby places');
    }
  };

  const toggleRandomMarkers = () => {
    if (showRandomMarkers) {
      setShowRandomMarkers(false);
      setRandomMarkers([]);
    } else {
      const randomLocations = [
        { latitude: 17.385044, longitude: 78.486671, title: 'Random Location 1' },
        { latitude: 17.391044, longitude: 78.486671, title: 'Random Location 2' },
        { latitude: 17.385044, longitude: 78.491671, title: 'Random Location 3' },
        { latitude: 17.380044, longitude: 78.481671, title: 'Random Location 4' },
      ];
      setRandomMarkers(randomLocations);
      setShowRandomMarkers(true);
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
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
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
              }}
              title={place.name}
              description={place.vicinity}
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
        </MapView>
      )}
      <View style={[styles.getCurrentLocationButtonContainer, styles.bottomRight]}>
        <TouchableOpacity style={styles.circleButton} onPress={getCurrentLocation}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.circleButton} onPress={fetchNearbyPlaces}>
          <Ionicons name="medkit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton} onPress={toggleRandomMarkers}>
          <Ionicons name="pin" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
  },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  circleButton: {
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
    marginHorizontal: 5,
  },
});
