import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert, ScrollView, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../utils/firebase'; // Adjust the import path as per your project structure
import { useTranslation } from 'react-i18next';

export default function Nearby() {
  const { t } = useTranslation();
  const [region, setRegion] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showNearbyPlaces, setShowNearbyPlaces] = useState(false);
  const [randomMarkers, setRandomMarkers] = useState([]);
  const [showRandomMarkers, setShowRandomMarkers] = useState(false);
  const [volunteerMarkers, setVolunteerMarkers] = useState([]);
  const [showVolunteerMarkers, setShowVolunteerMarkers] = useState(false); // State for showing volunteer markers
  const [selectedButton, setSelectedButton] = useState(null);

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
    } else {
      const randomLocations = [
        { latitude: 11.0168, longitude: 76.9558, title: 'Communnity Shelter 1' },
        { latitude: 11.0200, longitude: 76.9660, title: 'Communnity Shelter 2' },
        { latitude: 11.0100, longitude: 76.9500, title: 'Communnity Shelter 3' },
        { latitude: 11.0250, longitude: 76.9700, title: 'Communnity Shelter 4' },
        { latitude: 11.0120, longitude: 76.9580, title: 'Communnity Shelter 5' },
      ];
  
      setRandomMarkers(randomLocations);
      setShowRandomMarkers(true);
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

  const handleButtonPress = (type) => {
    setSelectedButton(type);
    if (type === 'hospitals') toggleNearbyHospitals();
    if (type === 'medicals') toggleNearbyMedicals();
    if (type === 'food') toggleNearbyFood();
    if (type === 'police') toggleNearbyPoliceStations();
    if (type === 'stays') toggleRandomMarkers();
    if (type === 'volunteers') toggleVolunteerMarkers();
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
      // Adjust the collection reference to 'MemberSignup'
      const memberSignupCollection = collection(firestore, 'MemberSignup');
      
      const volunteerSnapshot = await getDocs(memberSignupCollection);
      const volunteerLocationsPromises = volunteerSnapshot.docs.map(async (doc) => {
        const locationAddress = doc.data().location;
        const name = doc.data().name;
  
        // Geocode the location address to get latitude and longitude
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
          params: {
            address: locationAddress,
            key: 'AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc',
          },
        });
  
        const { lat, lng } = response.data.results[0].geometry.location;
  
        return {
          latitude: lat,
          longitude: lng,
          title: name,
        };
      });
  
      const volunteerLocations = await Promise.all(volunteerLocationsPromises);
      
      // Log the fetched locations
    //  console.log('Fetched Volunteer Locations:', volunteerLocations);
      
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
      
        {showVolunteerMarkers && volunteerMarkers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            pinColor="orange"
          />
        ))}
      </MapView>
      
      )}
      <View style={[styles.getCurrentLocationButtonContainer, styles.bottomRight]}>
        <TouchableOpacity style={styles.circleButton} onPress={getCurrentLocation} activeOpacity={0.8}>
          <Ionicons name="locate" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.buttonContainer} horizontal showsHorizontalScrollIndicator={false}>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'hospitals' && styles.selectedButton]}
    onPress={() => handleButtonPress('hospitals')}
    activeOpacity={0.8}
  >
    <Ionicons name="medkit" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Hospitals')}</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'medicals' && styles.selectedButton]}
    onPress={() => handleButtonPress('medicals')}
    activeOpacity={0.8}
  >
    <Ionicons name="business" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Medicals')}</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'food' && styles.selectedButton]}
    activeOpacity={0.8}
    onPress={() => handleButtonPress('food')}
  >
    <Ionicons name="restaurant" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Food')}</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'police' && styles.selectedButton]}
    onPress={() => handleButtonPress('police')}
  >
    <Ionicons name="shield" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Police Stations')}</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'stays' && styles.selectedButton]}
    onPress={() => handleButtonPress('stays')}
  >
    <Ionicons name="star" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Stays')}</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.rectangleButton, selectedButton === 'volunteers' && styles.selectedButton]}
    onPress={() => handleButtonPress('volunteers')}
  >
    <Ionicons name="people" size={24} color="white" style={styles.icon} />
    <Text style={styles.buttonText}>{t('Volunteers')}</Text>
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
    backgroundColor: '#000000',
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
    left: 5,
  },
  rectangleButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    marginLeft: 5,
    padding: 10, // Adjust padding as needed
    flexDirection: 'row', // Arrange icon and text horizontally
    alignItems: 'center', // Center items vertically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
   }, // Add margin to separate icon and text
   selectedButton: {
    backgroundColor: '#007bff', // Highlight color
  },
});
