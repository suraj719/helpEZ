import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Dimensions,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore";
import { firestore } from "../utils/firebase";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as geolib from "geolib";
import { useTranslation } from 'react-i18next';

// Assume you have imported React Navigation dependencies here
import { useNavigation } from "@react-navigation/native";
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';

const { width, height } = Dimensions.get('window');
const Family = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [familyPhoneNumber, setFamilyPhoneNumber] = useState("");
  const [familyMembers, setFamilyMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  const mapRef = useRef(null);
  const snapPoints = useMemo(() => [80, '50%', '90%'], []);
  //  const { width, height } = Dimensions.get('window');

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
        console.error(
          "Error fetching user's phone number from AsyncStorage:",
          error
        );
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
      if (status !== "granted") {
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
        const q = query(
          collection(firestore, "familyMembers"),
          where("phoneNumber", "==", userPhoneNumber)
        );
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
      if (
        !userDoc.location ||
        !userDoc.location.latitude ||
        !userDoc.location.longitude
      ) {
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

      const familyQuery = query(
        collection(firestore, "familyMembers"),
        where("phoneNumber", "==", userPhoneNumber)
      );
      const familySnapshot = await getDocs(familyQuery);

      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data();

        await setDoc(
          doc(firestore, "familyMembers", familyDoc.id),
          {
            ...familyData,
            members: [...familyData.members, newMember],
          },
          { merge: true }
        );
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
      const familyQuery = query(
        collection(firestore, "familyMembers"),
        where("phoneNumber", "==", userPhoneNumber)
      );
      const familySnapshot = await getDocs(familyQuery);

      if (!familySnapshot.empty) {
        const familyDoc = familySnapshot.docs[0];
        const familyData = familyDoc.data();

        const updatedMembers = familyData.members.filter(
          (member) => member.phoneNumber !== phoneNumber
        );

        await setDoc(
          doc(firestore, "familyMembers", familyDoc.id),
          {
            ...familyData,
            members: updatedMembers,
          },
          { merge: true }
        );

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

  const navigateToChat = (member) => {
    navigation.navigate("ChatScreen", {
      memberName: member.name,
      memberPhoneNumber: member.phoneNumber,
      memberLocation: member.location,
    });
  };

  const handleAnimateToLocation = (location) => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const handleRecenter = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.024,
      });
    } else {
      Alert.alert(
        "Location not available",
        "Current location is not available. Please check your location settings."
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.maps}>
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
              {familyMembers.map((member, index) => (
                member.location && member.location.latitude && member.location.longitude ? (
                  <Marker
                    key={index}
                    coordinate={{
                      latitude: member.location.latitude,
                      longitude: member.location.longitude,
                    }}
                    title={member.name}
                    description={member.phoneNumber}
                  />
                ) : null
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
      </View>

      <BottomSheet index={0} snapPoints={snapPoints}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Family Members</Text>
          <BottomSheetFlatList
            data={familyMembers}
            contentContainerStyle={{ gap: 10, padding: 20, }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card}
                onPress={() => handleAnimateToLocation(item.location)}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 4 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text>{`${calculateDistance(currentLocation, item.location).value
                    } ${calculateDistance(currentLocation, item.location).unit
                    }`}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 6 }}>
                  <Text>{item.phoneNumber}</Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <TouchableOpacity onPress={() => deleteFamilyMember(item.phoneNumber)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigateToChat(item)} style={{ paddingTop: 4 }}>
                    <AntDesign name="arrowright" size={28} color="black" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheet>


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


        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add Family Member</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number:</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={familyPhoneNumber}
                onChangeText={setFamilyPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleAddMember}>
                <Text style={styles.buttonText}>Add Member</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    backgroundColor: "#fff",
  },


  // map: {
  //   width: Dimensions.get("window").width,
  //   height: Dimensions.get("window").height / 2.5,
  // },
  map: {
    // width: Dimensions.get('window').width , // Slightly smaller than full width
    // height: Dimensions.get('window').height / 2.5,
    width: width, // Full width of the screen
    height: height,
    borderRadius: 40, // Curved corners
    borderWidth: 2,
    borderColor: '#ddd',
    shadowColor: '#000', // Shadow for better depth
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  maps: {
    padding: 10,
    borderWidth: 0,
    borderRadius: 20,       // Set the border width
    borderColor: '#000',     // Set the border color
    borderStyle: 'solid',    // Choose the border style
    overflow: 'hidden',
  },



  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 25,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 'bold',
  },
  inputContainer: {

    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    width: '80%',
  },
  label: {
    bottom: 10,
    width: '30%', // Adjust this width as needed
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    width: '70%', // Adjust this width as needed
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00A3E0',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: 'white',
  },


  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    left: 20,
  },
  card: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    width: Dimensions.get("window").width - 40,
  },
  recenterButton: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    elevation: 4,
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
    backgroundColor: "black",
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
    backgroundColor: "black",
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
    backgroundColor: "black",
  },
});

export default Family;
