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
import { collection, getDocs, query, where, setDoc, doc } from "firebase/firestore";
import { firestore } from "../utils/firebase";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as geolib from 'geolib';
import ChatScreen from "./ChatScreen";

// Assume you have imported React Navigation dependencies here
import { useNavigation } from '@react-navigation/native';

const Family = () => {
  const navigation = useNavigation();

  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [familyPhoneNumber, setFamilyPhoneNumber] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const storedUserPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (storedUserPhoneNumber) {
          setUserPhoneNumber(storedUserPhoneNumber);
        } else {
          Toast.show({
            type: "error",
            text1: "User's phone number not found in AsyncStorage",
          });
        }
      } catch (error) {
        console.error("Error fetching user's phone number from AsyncStorage:", error);
        Toast.show({
          type: "error",
          text1: "Error fetching user's phone number",
        });
      }
    };

    fetchPhoneNumbers();
  }, []);

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
      if (!userPhoneNumber) return;
  
      try {
        const q = query(collection(firestore, "familyMembers"), where("phoneNumber", "==", userPhoneNumber));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const familyMemberDoc = querySnapshot.docs[0];
          const familyMemberData = familyMemberDoc.data();
          const members = familyMemberData.members || [];
          setFamilyMembers(members);
        } else {
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error("Error fetching family members:", error);
      }
    };
    fetchFamilyMembers();
  }, [userPhoneNumber]);

  const handleAddMember = async () => {
    if (!name || !familyPhoneNumber) {
      Toast.show({
        type: "error",
        text1: "Please fill all the fields",
      });
      return;
    }

    try {
      const q = query(
        collection(firestore, "users"),
        where("phoneNumber", "==", familyPhoneNumber)
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
        name: name,
        phoneNumber: userDoc.phoneNumber,
        location: {
          latitude: userDoc.location.latitude,
          longitude: userDoc.location.longitude,
        },
      };

      const familyQuery = query(collection(firestore, "familyMembers"), where("phoneNumber", "==", userPhoneNumber));
      const familySnapshot = await getDocs(familyQuery);

      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data();

        await setDoc(doc(firestore, "familyMembers", familyDoc.id), {
          ...familyData,
          members: [...familyData.members, newMember],
        }, { merge: true });
      } else {
        const newFamilyDocRef = doc(collection(firestore, "familyMembers"));
        await setDoc(newFamilyDocRef, {
          name: name,
          phoneNumber: userPhoneNumber,
          members: [newMember],
        });
      }

      setFamilyMembers([...familyMembers, newMember]);
      Toast.show({
        type: "success",
        text1: "Family member added successfully",
      });
      setModalVisible(false);
      setName("");
      setFamilyPhoneNumber("");
    } catch (error) {
      console.error("Error adding family member: ", error);
      Toast.show({
        type: "error",
        text1: "Error adding family member",
      });
    }
  };

  const deleteFamilyMember = async (phoneNumber) => {
    try {
      const familyQuery = query(collection(firestore, "familyMembers"), where("phoneNumber", "==", userPhoneNumber));
      const familySnapshot = await getDocs(familyQuery);

      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data();

        const updatedMembers = familyData.members.filter(member => member.phoneNumber !== phoneNumber);

        await setDoc(doc(firestore, "familyMembers", familyDoc.id), {
          ...familyData,
          members: updatedMembers,
        }, { merge: true });

        setFamilyMembers(updatedMembers);
        Toast.show({
          type: "success",
          text1: "Family member deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting family member: ", error);
      Toast.show({
        type: "error",
        text1: "Error deleting family member",
      });
    }
  };

  const calculateDistance = (current, destination) => {
    const distance = geolib.getDistance(
      { latitude: current.latitude, longitude: current.longitude },
      { latitude: destination.latitude, longitude: destination.longitude }
    );

    if (distance < 1000) {
      return { value: distance, unit: 'm' };
    } else {
      return { value: (distance / 1000).toFixed(2), unit: 'km' };
    }
  };

  const navigateToChat = (member) => {
    navigation.navigate('ChatScreen', {
      memberName: member.name,
      memberPhoneNumber: member.phoneNumber,
      memberLocation: member.location,
    });
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
              description={`Distance: ${calculateDistance(
                currentLocation,
                member.location
              ).value} ${calculateDistance(currentLocation, member.location).unit}`}
              onPress={() => navigateToChat(member)}
            />
          ))}
          <Marker
            coordinate={currentLocation}
            title="Current Location"
            pinColor="blue"
          />
        </MapView>
      )}
      <Text style={styles.title}>Family Members</Text>
      <FlatList
        data={familyMembers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigateToChat(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.phoneNumber}</Text>
            <Text>{`Distance: ${calculateDistance(
              currentLocation,
              item.location
            ).value} ${calculateDistance(currentLocation, item.location).unit}`}</Text>
            <TouchableOpacity onPress={() => deleteFamilyMember(item.phoneNumber)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>
      <Modal
        animationType="fade"
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
            value={familyPhoneNumber}
            onChangeText={setFamilyPhoneNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddMember}>
            <Text style={styles.buttonText}>Add Member</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setModalVisible(false)}
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: Dimensions.get("window").width - 40,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  deleteButton: {
    color: "red",
    marginTop: 10,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "blue",
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
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
    fontSize: 20,
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "blue",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "red",
  },
});

export default Family;
