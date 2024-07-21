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
  TextInput,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { FontAwesome6 } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { app } from "../utils/firebase";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import * as geolib from "geolib";

const DropOffScreen = () => {
  const navigation = useNavigation();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const mapRef = useRef(null);
  const db = getFirestore(app);

  const fetchWarehouses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "warehouse"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWarehouses(data);
    } catch (error) {
      console.error("Error fetching warehouses: ", error);
    }
  };

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

  const handleRecenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.024,
      });
    }
  };

  const calculateDistance = (current, destination) => {
    if (!current || !destination) return { value: "-", unit: "-" };
    const distance = geolib.getDistance(
      { latitude: current.latitude, longitude: current.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    );

    if (distance < 1000) {
      return { value: distance, unit: "m" };
    } else {
      return { value: (distance / 1000).toFixed(2), unit: "km" };
    }
  };

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

  useEffect(() => {
    fetchCurrentLocation();
    fetchWarehouses();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Drop off at nearest warehouse</Text>
      </View>
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
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={24} color="#896161" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search warehouses"
            placeholderTextColor="#896161"
          />
        </View>
      </View>
      <Text style={styles.warehead}>Nearest warehouses</Text>
      <FlatList
        data={warehouses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const distance = calculateDistance(currentLocation, item);
          return (
            <TouchableOpacity
              style={styles.warehouseCard}
              onPress={() => handleWarehousePress(item)}
            >
              <View style={styles.textContainer}>
                <Text style={styles.warehouseDistance}>{`${distance.value} ${distance.unit}`}</Text>
                <Text style={styles.warehouseName}>{item.name}</Text>
                <Text style={styles.warehouseAddress}>{item.address}</Text>
                <Text style={styles.warehouseAddress}>{item.phone}</Text>
              </View>
              <Image
                source={{ uri: "https://cdn.usegalileo.ai/stability/220bd1c1-8535-4ce2-8c60-c4a82efdefe4.png" }}
                style={styles.warehouseImage}
              />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    right: 60,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2.5,
  },
  recenterButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  warehead: {
    padding: 16,
    fontSize: 22,
    fontWeight: "bold",
  },
  warehouseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 7,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10,
  },
  warehouseDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  warehouseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  warehouseAddress: {
    fontSize: 14,
    color: '#896161',
  },
  warehouseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  markerImage: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
});

export default DropOffScreen;
