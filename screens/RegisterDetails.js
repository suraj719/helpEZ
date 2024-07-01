import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterDetails({ phoneNumber, changeNumber }) {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const usersCollection = collection(db, "users");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    if (!name || !gender || !dob || !bloodGroup) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }

    const formattedDob = dob.toISOString().split("T")[0]; // Format to 'YYYY-MM-DD'
    const createdAt = new Date().toLocaleString(); // Format to a readable string
    const userData = {
      createdAt: createdAt,
      phoneNumber: phoneNumber,
      name: name,
      gender: gender,
      dob: formattedDob,
      bloodGroup: bloodGroup,
      alternateContact: alternateContact,
    };

    setLoading(true);
    try {
      await addDoc(usersCollection, userData);
      await AsyncStorage.setItem("phoneNumber", phoneNumber); // Set phone number in AsyncStorage
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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Please provide some more details!</Text>
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
        <TouchableOpacity
          onPress={() => changeNumber(false)}
          style={styles.changePhoneButton}
          activeOpacity={0.7}
        >
          <Text style={styles.changePhoneButtonText}>Change Phone Number</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => createAccount()}
            style={styles.button}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Proceed</Text>
            )}
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
  changePhoneButton: {
    alignSelf: "center",
    marginBottom: 5,
  },
  changePhoneButtonText: {
    color: "#3498db",
    fontSize: 14,
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
  picker: {
    flex: 1,
    marginLeft: 10,
    color: "#2c3e50",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    elevation: 5,
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
    // backgroundColor: "#3498db",
    backgroundColor: "#000",
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
