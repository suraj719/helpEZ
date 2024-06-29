import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  StyleSheet,
  Button,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  addDoc,
  collection,
  getFirestore,
  Timestamp,
} from "firebase/firestore";
import app from "../utils/firebase";
import RNPickerSelect from "react-native-picker-select";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";

export default function RegisterDetails({ phoneNumber }) {
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [alternateContact, setAlternateContact] = useState("");

  const createAccount = async () => {
    if (!name || !gender || !dob || !bloodGroup) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const formattedDob = dob.toISOString().split("T")[0]; // Format to 'YYYY-MM-DD'
    const userData = {
      createdAt: Timestamp.now(),
      phoneNumber: phoneNumber,
      name: name,
      gender: gender,
      dob: formattedDob,
      bloodGroup: bloodGroup,
      alternateContact: alternateContact,
    };
    try {
      await addDoc(usersCollection, userData);
      Alert.alert("User registered successfully");
    } catch (error) {
      console.log("Error while creating account", error);
      Alert.alert("Error", "There was an error while creating the account");
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Please provide some more details!!</Text>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#2c3e50" style={styles.icon} />
          <TextInput
            style={styles.input}
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
          <RNPickerSelect
            onValueChange={(value) => setGender(value)}
            items={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
            ]}
            placeholder={{ label: "Select Gender *", value: null }}
            style={pickerSelectStyles}
            useNativeAndroidPickerStyle={false}
            // Icon={() => {
            //   return <Icon name="caret-down" size={20} color="#2c3e50" />;
            // }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateInput}
        >
          <Icon name="calendar" size={20} color="#2c3e50" style={styles.icon} />
          <Text style={styles.dateText}>{dob.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
        <View style={styles.inputContainer}>
          <Icon name="water" size={20} color="#2c3e50" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={bloodGroup}
            onChangeText={setBloodGroup}
            placeholder="Blood Group *"
            placeholderTextColor="#bdc3c7"
          />
        </View>
        <View style={styles.inputContainer}>
          <Icon name="call" size={20} color="#2c3e50" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={alternateContact}
            onChangeText={setAlternateContact}
            placeholder="Alternate Contact Number"
            placeholderTextColor="#bdc3c7"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => createAccount()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
  },
  authContainer: {
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 5,
    width: "90%",
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: "#2c3e50",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    elevation: 5,
    // borderColor: "#bdc3c7",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#2c3e50",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    elevation: 5,
    // borderColor: "#bdc3c7",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  dateText: {
    marginLeft: 10,
    color: "#2c3e50",
  },
  buttonContainer: {
    marginTop: 16,
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
  icon: {
    marginRight: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      flex: 1,
      height: 50,
      borderColor: "#bdc3c7",
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: 16,
    },
    inputAndroid: {
    //   flex: 1,
      height: 50,
      borderColor: "#bdc3c7",
      borderWidth: 1,
      padding: 10,
      borderRadius: 5,
      backgroundColor: "#ffffff",
      color: "#000000",
      fontSize: 16,
    },
    iconContainer: {
      top: 10,
      right: 12,
    },
    placeholder: {
      color: '#000000',
      fontSize: 16,
    },
  });
  