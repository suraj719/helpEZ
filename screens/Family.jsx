import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore } from "../utils/firebase";
import { useUser } from "../UserContext";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Location from 'expo-location';

const Family = () => {
  const { user } = useUser();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: "error",
          text1: "Permission to access location was denied",
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const querySnapshot = await getDocs(collection(firestore, "users"));
      const members = querySnapshot.docs.map((doc) => doc.data()).filter(member => member.location);
      setFamilyMembers(members);
    };

    fetchFamilyMembers();
  }, []);

  const handleAddMember = async () => {
    if (!name || !phoneNumber) {
      Toast.show({
        type: "error",
        text1: "Please fill all the fields",
      });
      return;
    }

    try {
      const q = query(
        collection(firestore, "users"),
        where("name", "==", name),
        where("phoneNumber", "==", phoneNumber)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Toast.show({
          type: "error",
          text1: "No matching user found",
        });
        return;
      }

      const userDoc = querySnapshot.docs[0].data();
      if (!userDoc.location || !userDoc.location.latitude || !userDoc.location.longitude) {
        Toast.show({
          type: "error",
          text1: "User's location information is incomplete",
        });
        return;
      }

      const newMember = {
        name: userDoc.name,
        phoneNumber: userDoc.phoneNumber,
        location: {
          latitude: userDoc.location.latitude,
          longitude: userDoc.location.longitude,
        },
      };

      setFamilyMembers([...familyMembers, newMember]);
      Toast.show({
        type: "success",
        text1: "Family member added successfully",
      });
      setModalVisible(false);
      setName("");
      setPhoneNumber("");
    } catch (error) {
      console.error("Error adding family member: ", error);
      Toast.show({
        type: "error",
        text1: "Error adding family member",
      });
    }
  };

  return (
    <View style={styles.container}>
      {currentLocation && (
        <MapView
          style={styles.map}
          initialRegion={currentLocation}
        >
          {familyMembers.map((member, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: member.location.latitude,
                longitude: member.location.longitude,
              }}
              title={member.name}
              description={member.phoneNumber}
            />
          ))}
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        </MapView>
      )}
      <FlatList
        data={familyMembers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.phoneNumber}</Text>
            <Text>{`Lat: ${item.location.latitude}, Lon: ${item.location.longitude}`}</Text>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Add Family Member</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddMember}>
            <Text style={styles.buttonText}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "red", marginTop: 10 }]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: Dimensions.get("window").height / 2,
  },
  card: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  name: {
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#000",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: "#e8e8e8",
    marginBottom: 20,
    width: "100%",
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Family;
