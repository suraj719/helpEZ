import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ImageBackground,
} from "react-native";
import app from "../utils/firebase";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { CheckBox } from "react-native-elements";

import { useNavigation, CommonActions } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function Register() {
  const [isChecked, setIsChecked] = useState(false);
  const { t } = useTranslation();
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
        // const storedName = await AsyncStorage.getItem("name");
        if (storedPhoneNumber) {
          setPhoneNumber(storedPhoneNumber);
        }
        // if (storedName) {
        //   setName(storedName);
        // }
      } catch (error) {
        console.log("Error retrieving data from storage", error);
      }
    };

    checkStoredUserData();
  }, []);

  useEffect(() => {
    if (isNewMember) {
      navigation.navigate("RegisterDetails", { phoneNumber });
    }
  }, [isNewMember, navigation]); // Added navigation as a dependency

  const signInWithPhoneNumber = async () => {
    if (!phoneNumber) {
      Toast.show({
        type: "error",
        text1: "Please enter both Name and Mobile Number",
      });
      return;
    }
    if (!isChecked) {
      Toast.show({
        type: "error",
        text1: "Please agree to our T&C to continue",
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
        await AsyncStorage.setItem("name", querySnapshot.docs[0].data().name); // Store name here
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          })
        );
      } else {
        navigation.navigate("RegisterDetails", { phoneNumber });
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("GalileoDesign")}
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/271/271220.png",
            }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://cdn.usegalileo.ai/sdxl10/b27516fe-a579-4bdd-bd02-0f982549ccf0.png",
          }}
          style={styles.image}
        />
      </View>
      <Text style={styles.title}>Sign in or create an account.</Text>
      {/* <View style={styles.inputContainer}>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#6B6B6B"
        />
      </View> */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Phone number"
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholderTextColor="#6B6B6B"
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={signInWithPhoneNumber}
        >
          <Text style={styles.buttonText}>Submit and verify</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.termsContainer}>
        <CheckBox
          containerStyle={styles.checkbox}
          checked={isChecked}
          onPress={() => setIsChecked(!isChecked)}
        />
        <Text style={styles.termsText}>
          By continuing, you are indicating that you agree to the Terms of
          Service and Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 16,
  },
  backButton: {
    width: 24,
    height: 24,
  },
  backIcon: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 3 / 2,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
  },
  inputContainer: {
    width: "90%",
    marginVertical: 10,
  },
  input: {
    height: 56,
    borderColor: "#DEDEDE",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  buttonContainer: {
    width: "90%",
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#000000",
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  checkbox: {
    margin: 0,
    padding: 0,
  },
  termsText: {
    fontSize: 16,
    flex: 1,
    paddingLeft: 8,
  },
});
