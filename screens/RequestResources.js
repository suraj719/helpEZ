import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import app from "../utils/firebase";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';

export default function RequestResources() {
  const { t } = useTranslation();
  const db = getFirestore(app);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [requestTitle, setrequestTitle] = useState("");
  const [requestDescription, setAdditionalInfo] = useState("");
  const [neededBy, setNeededBy] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async () => {
      await fetchUserLocation();
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setSeverity("Low");
      setrequestTitle("");
      setAdditionalInfo("");
      setNeededBy(new Date());
      fetchUserLocation();
    }, [])
  );
  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      // console.log("Permission to access location was denied");
      Toast.show({
        type: "error",
        text1: "Location access was denied!!",
      });
      return;
    }

    let userLocation = await Location.getCurrentPositionAsync({});
    setLocation({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
    });
    setRegion({
      latitude: userLocation.coords.latitude,
      longitude: userLocation.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  };
  const submitRequest = async () => {
    if (!requestTitle || !neededBy) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }
    const formattedDate = neededBy.toISOString().split("T")[0];
    const reportData = {
      location,
      severity,
      category,
      requestTitle,
      contact: await AsyncStorage.getItem("phoneNumber"),
      requestDescription,
      neededBy: formattedDate,
    };
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "requests"), reportData);
      console.log("Document written with ID: ", docRef.id);
      Toast.show({
        type: "success",
        text1: "Request submitted successfully",
      });
      navigation.navigate("Requests");
    } catch (error) {
      console.error("Error submitting request:", error);
      Toast.show({
        type: "error",
        text1: "Error submitting request",
      });
    } finally {
      setLoading(false);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setNeededBy(date);
    hideDatePicker();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity className="mb-4" onPress={() => navigation.goBack()}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <ScrollView>
        <Text className="text-md font-semibold mb-4">
          Request Resources that you need and we will get back to you with a
          good news!!
        </Text>
        <Text className="mb-2">requestTitle</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4 h-20"
          value={requestTitle}
          onChangeText={setrequestTitle}
          placeholder="Enter your requestTitle*"
          multiline
        />
        <Text className="mb-2">Severity</Text>
        <View className="bg-white rounded mb-4">
          <Picker
            selectedValue={severity}
            onValueChange={(itemValue) => setSeverity(itemValue)}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Moderate" value="Moderate" />
            <Picker.Item label="High" value="High" />
          </Picker>
        </View>
        <Text className="mb-2">Additional Information</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4"
          value={requestDescription}
          onChangeText={setAdditionalInfo}
          placeholder="Enter any additional information"
        />
        <Text className="mb-2">Needed By</Text>
        <TouchableOpacity
          className="bg-white p-2 rounded mb-4"
          onPress={showDatePicker}
        >
          <Text>{neededBy.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
        <Text className="mt-4">Location</Text>
        <View className="rounded h-50">
          <MapView
            style={{ width: "100%", height: 200, marginTop: 16 }}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            {location && (
              <Marker
                coordinate={location}
                draggable
                onDragEnd={(e) => setLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-gray-900 p-4 rounded mt-4 items-center"
          onPress={submitRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
