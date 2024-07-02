import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
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

  return (
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
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Phone Number *"
            keyboardType="phone-pad"
            placeholderTextColor="#888"
          />
          <View className="mb-4">
            <TouchableOpacity
              onPress={() => signInWithPhoneNumber(phoneNumber)}
              // style={styles.button}
              className="bg-black p-5 rounded-lg"
              activeOpacity={0.7}
            >
              <Text className="text-white font-bold text-center">Proceed</Text>
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
    backgroundColor: "#f9f9f9",
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
});
