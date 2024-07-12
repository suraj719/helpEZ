import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import app from "../utils/firebase";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import Toast from "react-native-toast-message";

export default function ReportIncident() {
  const storage = getStorage(app);
  const db = getFirestore(app);
  const navigation = useNavigation();
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [date, setDate] = useState(new Date());
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
      setDescription("");
      setContact("");
      setSelectedImages([]);
      setDate(new Date());
      fetchUserLocation();
    }, [])
  );
  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
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

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.cancelled) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const takePhoto = async () => {
  //   try {
  //     const { status } = await ImagePicker.requestCameraPermissionsAsync();
  //     if (status !== "granted") {
  //       Toast.show({
  //         type: "error",
  //         text1: "Camera access was denied!!",
  //       });
  //       return;
  //     }

  //     let result = await ImagePicker.launchCameraAsync({
  //       mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //       quality: 1,
  //     });

  //     if (!result.cancelled) {
  //       setSelectedImages([...selectedImages, result]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Camera access was denied!!",
        });
        return;
      }
  
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      if (!result.cancelled) {
        setSelectedImages([...selectedImages, result]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const uploadImagesToStorage = async () => {
    const imageUrls = [];

    try {
      await Promise.all(
        selectedImages.map(async (image, index) => {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          const imageName = `${title}-${index}`; 

          const storageRef = ref(storage, `uploads/${imageName}`);
          const uploadTask = uploadBytesResumable(storageRef, blob);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              },
              reject,
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  imageUrls.push(downloadURL);
                  resolve();
                });
              }
            );
          });
        })
      );

      console.log("All files uploaded:", imageUrls);
      return imageUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      return [];
    }
  };

  const submitReport = async () => {
    if (!title || !description) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }
    setLoading(true);
    const imageUrls = await uploadImagesToStorage();
    const formattedDate = date.toISOString().split("T")[0];
    const reportData = {
      location,
      title,
      severity,
      description,
      contact,
      images: imageUrls,
      date: formattedDate,
    };
    try {
      const docRef = await addDoc(collection(db, "incidents"), reportData);
      navigation.navigate("Incidents");
      Toast.show({
        type: "success",
        text1: "Incident successfully created",
      });
    } catch (error) {
      console.error("Error submitting report:", error);
      Toast.show({
        type: "error",
        text1: "Error submitting incident",
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
    setDate(date);
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
        <Text className="mb-2">Title</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title*"
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

        <Text className="mb-2">Description</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4 h-20"
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description*"
          multiline
        />

        <Text className="mb-2">Contact Information</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4"
          value={contact}
          onChangeText={setContact}
          placeholder="Enter suitable contact details"
        />

        <Text className="mb-2">Date</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          className="bg-white p-2 rounded mb-4"
          onPress={showDatePicker}
        >
          <Text>{date.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />

        <TouchableOpacity
          activeOpacity={0.7}
          className="border-2 p-4 rounded mt-4 flex flex-row justify-center items-center"
          onPress={pickImage}
        >
          <Ionicons name="image-outline" size={24} color="black" />
          <Text className="text-black text-center ml-2">
            Attach Photos/Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          className="border-2 p-4 rounded mt-4 flex flex-row justify-center items-center"
          onPress={takePhoto}
        >
          <Ionicons name="camera-outline" size={24} color="black" />
          <Text className="text-black text-center ml-2">
            Take a Photo
          </Text>
        </TouchableOpacity>

        <View className="flex flex-wrap flex-row mt-4">
          {selectedImages.map((image, index) => (
            <View key={index} className="m-1 relative">
              <Image
                source={{ uri: image.uri }}
                className="w-20 h-20 rounded-lg"
              />
              <TouchableOpacity
                className="absolute top-0 right-0 bg-black bg-opacity-50 p-1 rounded"
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
          onPress={submitReport}
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
