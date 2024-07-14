import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  addDoc,
  collection,
  getFirestore,
  updateDoc,
  doc,
} from "firebase/firestore";
import app from "../utils/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useTranslation } from "react-i18next";

export default function RegisterDetails({ route }) {
  const { phoneNumber} = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(false); // Added state for isVolunteer
  const [loading, setLoading] = useState(false);

  // Function to clear AsyncStorage items
  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.clear();
      console.log("AsyncStorage cleared successfully.");
    } catch (error) {
      console.log("Error clearing AsyncStorage:", error);
    }
  };

  // Clear AsyncStorage items when component mounts
  useEffect(() => {
    clearAsyncStorage();
  }, []);

  const createAccount = async () => {
    if (!name || !gender || !dob || !bloodGroup) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }

    const formattedDob = dob.toISOString().split("T")[0];
    const createdAt = new Date().toLocaleString();
    const userData = {
      createdAt: createdAt,
      phoneNumber: phoneNumber,
      name: name,
      gender: gender,
      dob: formattedDob,
      bloodGroup: bloodGroup,
      alternateContact: alternateContact,
      isVolunteer: isVolunteer, // Include isVolunteer in user data
      role: "",
    };

    setLoading(true);
    try {
      // Add user to Firestore
      const userDocRef = await addDoc(usersCollection, userData);

      // Fetch current location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission not granted");
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update user document with location data
      await updateDoc(doc(db, "users", userDocRef.id), {
        location: {
          latitude: latitude,
          longitude: longitude,
        },
      });

      // Store phone number in AsyncStorage
      await AsyncStorage.setItem("phoneNumber", phoneNumber);

      Toast.show({
        type: "success",
        text1: "Account created Successfully!",
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Dashboard" }],
        })
      );
    } catch (error) {
      console.log("Error while creating account", error);
      Toast.show({
        type: "error",
        text1: "Please try again later!",
      });
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "#ecf0f1",
      }}
    >
      <View className="justify-center bg-white py-8 px-5 rounded-lg shadow-lg w-[100%] max-w-[400px]">
        <Text className="text-xl mb-5 text-center text-[#2c3e50] font-bold">
          Please provide some more details!
        </Text>
        <View className="flex-row items-center h-12 shadow border mb-4 px-3 rounded bg-white">
          <Icon name="person" size={20} color="#2c3e50" className="mr-2.5" />
          <TextInput
            className="flex-1 ml-2 text-[#2c3e50]"
            value={name}
            onChangeText={setName}
            placeholder="Full Name *"
            placeholderTextColor="#bdc3c7"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon
            name="male-female"
            size={20}
            color="#2c3e50"
            style={styles.icon}
          />
          <Picker
            selectedValue={gender}
            style={styles.picker}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="Select Gender *" value="" color="#939da3" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
          </Picker>
        </View>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
          className="flex-row items-center h-12 shadow border mb-4 px-3 rounded bg-white"
        >
          <Icon name="calendar" size={20} color="#2c3e50" className="mr-2.5" />
          <Text className="ml-2 text-[#2c3e50]">
            {dob.toISOString().split("T")[0]}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <View className="flex-row items-center h-12 shadow border mb-4 px-3 rounded bg-white">
          <Icon name="water" size={20} color="#2c3e50" className="mr-2.5" />
          <TextInput
            className="flex-1 ml-2 text-[#2c3e50]"
            value={bloodGroup}
            onChangeText={setBloodGroup}
            placeholder="Blood Group *"
            placeholderTextColor="#bdc3c7"
          />
        </View>
        <View className="flex-row items-center h-12 shadow border mb-4 px-3 rounded bg-white">
          <Icon name="call" size={20} color="#2c3e50" className="mr-2.5" />
          <TextInput
            className="flex-1 ml-2 text-[#2c3e50]"
            value={alternateContact}
            onChangeText={setAlternateContact}
            placeholder="Alternate Contact Number"
            placeholderTextColor="#bdc3c7"
            keyboardType="phone-pad"
          />
        </View>
        {/* <TouchableOpacity
          onPress={() => changeNumber(false)}
          className="self-center mb-1.5"
          activeOpacity={0.7}
        >
          <Text className="text-[#3498db] text-sm">Change Phone Number</Text>
        </TouchableOpacity> */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => createAccount()}
            className="bg-black py-3 px-5 items-center rounded"
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Proceed</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  picker: {
    flex: 1,
    marginLeft: 10,
    color: "#2c3e50",
  },
});
