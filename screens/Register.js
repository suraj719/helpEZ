import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import app from "../utils/firebase";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import RegisterDetails from "./RegisterDetails";
import { useNavigation } from "@react-navigation/native";

export default function Register() {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNewMember, setIsNewMember] = useState(false);

  const signInWithPhoneNumber = async (pn) => {
    try {
      const q = query(usersCollection, where("phoneNumber", "==", pn));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        navigation.navigate("Home");
        // Alert.alert("User already exists");
      } else {
        setIsNewMember(true);
      }
    } catch (error) {
      console.log("Error while fetching details", error);
    }
  };

  return (
    <View style={styles.container}>
      {isNewMember ? (
        <RegisterDetails phoneNumber={phoneNumber} />
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome !!</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number"
            keyboardType="phone-pad"
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Proceed"
              onPress={() => signInWithPhoneNumber(phoneNumber)}
              color="#3498db"
            />
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
    // padding: 16,
    backgroundColor: "#f0f0f0",
  },
  authContainer: {
    width: "80%",
    // maxWidth: 400,
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
});
