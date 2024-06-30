import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
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
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register() {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNewMember, setIsNewMember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStoredPhoneNumber = async () => {
      try {
        const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
          signInWithPhoneNumber(storedPhoneNumber);
        }
      } catch (error) {
        console.log("Error retrieving phone number from storage", error);
      }
    };

    checkStoredPhoneNumber();
  }, []);

  const signInWithPhoneNumber = async (pn) => {
    if (!pn) {
      Toast.show({
        type: "error",
        text1: "Please enter your Mobile Number",
      });
      return;
    }
    setLoading(true);
    try {
      const q = query(usersCollection, where("phoneNumber", "==", pn));
      const querySnapshot = await getDocs(q);
      setLoading(false);
      if (!querySnapshot.empty) {
        await AsyncStorage.setItem("phoneNumber", pn);
        navigation.navigate("Dashboard");
        setLoading(false);
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

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : isNewMember ? (
        <RegisterDetails phoneNumber={phoneNumber} />
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome !!</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number *"
            keyboardType="phone-pad"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => signInWithPhoneNumber(phoneNumber)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Proceed</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  authContainer: {
    width: "80%",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 50,
    padding: 16,
    borderRadius: 5,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 15,
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
