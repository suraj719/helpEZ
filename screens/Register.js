import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ImageBackground, // Import ImageBackground component
} from "react-native";
import app from "../utils/firebase";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import RegisterDetails from "./RegisterDetails";
import { useNavigation, CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState(""); // State for user's name
  const [isNewMember, setIsNewMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStoredUserData = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        const storedName = await AsyncStorage.getItem("name");
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
        if (storedName) {
          setName(storedName);
        }
      } catch (error) {
        console.log("Error retrieving data from storage", error);
      }
    };

    checkStoredUserData();
  }, []);

  const signInWithPhoneNumber = async () => {
    if (!phoneNumber || !name) {
      Toast.show({
        type: "error",
        text1: "Please enter both Name and Mobile Number",
      });
      return;
    }
    setLoading(true);
    try {
      const q = query(usersCollection, where("phoneNumber", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      setLoading(false);
      if (!querySnapshot.empty) {
        await AsyncStorage.setItem("phoneNumber", phoneNumber);
        await AsyncStorage.setItem("name", name); // Store name here
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          })
        );
      } else {
        setIsNewMember(true);
      }
    } catch (error) {
      setLoading(false);
      console.log("Error fetching details", error);
      Toast.show({
        type: "error",
        text1: "Error fetching details",
      });
    }
  };

  const storeNameInStorage = async (name) => {
    try {
      await AsyncStorage.setItem("name", name);
      setName(name);
      console.log(`Name "${name}" stored successfully in AsyncStorage`);
    } catch (error) {
      console.error("Error storing name in AsyncStorage:", error);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/Designer (1).png")} // Replace with your background image path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : isNewMember ? (
          <RegisterDetails
            changeNumber={setIsNewMember}
            phoneNumber={phoneNumber}
          />
        ) : (
          <View style={styles.authContainer}>
            <Image source={require("../assets/logo.png")} style={styles.image} />
            <Text style={styles.description}>
              HelpEZ helps manage disasters efficiently by connecting people in
              need with resources and assistance. Join us in making a difference.
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name *"
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number *"
              keyboardType="phone-pad"
              placeholderTextColor="#888"
            />
            <TouchableOpacity
              onPress={() => signInWithPhoneNumber()}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Optional: Add a semi-transparent overlay
  },
  authContainer: {
    width: "85%",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  image: {
    alignSelf: "center",
    width: 250,
    height: 200,
    marginBottom: 20,
  },
  description: {
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    backgroundColor: "#e8e8e8",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
