import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";

const RegisterDetails = () => {
  const navigation = useNavigation();
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [alternateContact, setAlternateContact] = useState("");
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === "ios");
    setDob(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setGenderModalVisible(false);
  };

  const handleSubmit = () => {
    if (fullName && gender && bloodGroup && alternateContact) {
      Alert.alert("Success", "Form Submitted Successfully");
    } else {
      Alert.alert("Error", "Please fill all fields");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingView}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Register</Text>
        </View>
        <View className="m-4">
          <ImageBackground
            source={require("../assets/images/register.png")}
            style={styles.imageBackground}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6B6B6B"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputLeft}
            onPress={() => setGenderModalVisible(true)}
          >
            <Text style={styles.inputText}>{gender || "Select Gender"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setGenderModalVisible(true)}
            style={styles.iconContainer}
          >
            <Icon name="chevron-down" size={24} />
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={genderModalVisible}
          onRequestClose={() => {
            setGenderModalVisible(false);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalItem}
                onPress={() => handleGenderSelect("Male")}
              >
                <Text style={styles.modalText}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalItem}
                onPress={() => handleGenderSelect("Female")}
              >
                <Text style={styles.modalText}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.modalItem}
                onPress={() => handleGenderSelect("Other")}
              >
                <Text style={styles.modalText}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={styles.inputContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.inputLeft}
            onPress={showDatepicker}
          >
            <Text style={styles.inputText}>
              {dob ? dob.toLocaleDateString() : "DOB"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={showDatepicker}
            style={styles.iconContainer}
          >
            <Icon name="calendar-month" size={24} />
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Blood Group"
            placeholderTextColor="#6B6B6B"
            value={bloodGroup}
            onChangeText={setBloodGroup}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Alternate Contact Number"
            placeholderTextColor="#6B6B6B"
            value={alternateContact}
            onChangeText={setAlternateContact}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Register")}
            className="bg-gray-300"
            style={styles.cancelButton}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footerSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  title: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 16,
  },
  imageBackground: {
    width: "100%",
    height: 218,
    borderRadius: 15,
    overflow: "hidden",
  },
  inputContainer: {
    maxWidth: 480,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    borderColor: "#DEDEDE",
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  inputLeft: {
    flex: 1,
    borderColor: "#DEDEDE",
    borderWidth: 1,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    padding: 15,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  inputText: {
    color: "#6B6B6B",
    fontSize: 16,
  },
  iconContainer: {
    borderColor: "#DEDEDE",
    borderWidth: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 13,
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: 480,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    // backgroundColor: "#EEEEEE",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "#000000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footerSpacing: {
    height: 20,
    backgroundColor: "#FFFFFF",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 200,
  },
  modalItem: {
    width: "100%",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#DEDEDE",
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    color: "#000000",
  },
});

export default RegisterDetails;
