import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import app from "../utils/firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { addDoc, collection, getFirestore } from "firebase/firestore";

export default function ReportIncident() {
  const storage = getStorage(app);
  const db = getFirestore(app);
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Select severity level");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  //   const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
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
    })();
  }, []);

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
          const imageName = `${title}-${index}`; // Assuming `title` is defined elsewhere

          const storageRef = ref(storage, `uploads/${imageName}`);
          const uploadTask = uploadBytesResumable(storageRef, blob);

          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
              },
              reject,
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                  imageUrls.push(downloadURL);
                  console.log("File available at", downloadURL);
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
    // console.log({
    //   location,
    //   title,
    //   severity,
    //   description,
    //   contact,
    //   selectedImages,
    //   date,
    // });
    const imageUrls = await uploadImagesToStorage();
    const formattedDate = date.toISOString().split("T")[0];
    // Prepare data object to save in Firestore
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
      const docRef = await addDoc(collection(db, "reports"), reportData);
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error submitting report:", error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <ScrollView>
        <Text className="text-xl font-bold mb-4">Report an Incident</Text>

        <Text className="mb-2">Title</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title"
        />

        <Text className="mb-2">Severity</Text>
        <View className="bg-white rounded mb-4">
          <Picker
            selectedValue={severity}
            onValueChange={(itemValue) => setSeverity(itemValue)}
          >
            <Picker.Item label="Select severity level" value="" />
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
          placeholder="Enter description"
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
          className="bg-white p-2 rounded mb-4"
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

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
          <Text className="text-white font-bold text-lg">Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}