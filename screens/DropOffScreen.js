import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome6 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons"; // Added Ionicons import
import { useNavigation } from "@react-navigation/native";
import { app } from "../utils/firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";

// Define the DropOffScreen component
const DropOffScreen = () => {
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const mapRef = useRef(null);
  const db = getFirestore(app);

  // Fetch warehouse data from Firestore
  const fetchWarehouses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "warehouse")); // Adjust collection name if needed
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses: ", error);
    }
  };

  // Fetch current location
  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Error fetching location: ", error);
    }
  };

  // Recenter map to user's current location
  const handleRecenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.024,
      });
    }
  };

  // Handle warehouse press
  const handleWarehousePress = (warehouse) => {
    Alert.alert(
      "Confirm Drop-Off",
      `Are you sure you want to drop off items at ${warehouse.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => {
            navigation.navigate("DonateForm", { selectedWarehouse: warehouse });
          },
        },
      ]
    );
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchCurrentLocation();
    fetchWarehouses();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <View style={styles.backButtonContent}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </View>
      </TouchableOpacity>
      {currentLocation && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              ...currentLocation,
              latitudeDelta: 0.032,
              longitudeDelta: 0.021,
            }}
          >
            {warehouses.map((warehouse) => (
              <Marker
                key={warehouse.id}
                coordinate={{
                  latitude: warehouse.latitude,
                  longitude: warehouse.longitude,
                }}
                title={warehouse.name}
                description={warehouse.address}
              >
                <Image
                  source={require('../assets/images/warehouse-svgrepo-com.png')}
                  style={styles.markerImage}
                />
              </Marker>
            ))}
            <Marker
              coordinate={currentLocation}
              title="Current Location"
              pinColor="blue"
            />
          </MapView>
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={handleRecenter}
          >
            <FontAwesome6 name="location-crosshairs" size={24} color="black" />
          </TouchableOpacity>
        </>
      )}
      <Text style={styles.warehead}>Warehouse Details</Text>
      <FlatList
        data={warehouses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.warehouseCard}
            onPress={() => handleWarehousePress(item)}
          >
            <Text style={styles.warehouseName}>{item.name}</Text>
            <Text>{item.address}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

// Define the styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  warehead:{
    top: 10,
    bottom: 10,
    fontSize: 25,
    fontWeight: 'bold',
    left: 30,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2.5,
  },
  recenterButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  warehouseCard: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    elevation: 3,
  },
  warehouseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  flatListContent: {
    top: 10,
    paddingBottom: 20,
  },
  markerImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default DropOffScreen;
