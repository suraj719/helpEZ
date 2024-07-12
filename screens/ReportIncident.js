import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import axios from "axios";
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
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function ReportIncident() {
  const storage = getStorage(app);
  const db = getFirestore(app);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

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

    try {
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
    } catch (error) {
      console.error("Error fetching location:", error);
      Toast.show({
        type: "error",
        text1: "Failed to fetch location details",
      });
    }
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
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

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc`
      );

      let locationText = "";
      if (response.data.results.length > 0) {
        const addressComponents = response.data.results[0].address_components;
        let village = "";
        let state = "";

        for (let component of addressComponents) {
          if (component.types.includes("locality")) {
            village = component.long_name;
          }
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
        }

        locationText = `${village}, ${state}`;
      } else {
        console.warn("No address components found");
        locationText = `${location.latitude}, ${location.longitude}`;
      }

      await schedulePushNotification({
        title: "New Incident Reported!",
        body: `Title: ${title}\nSeverity: ${severity}\nLocation: ${locationText}`,
        data: { title, severity, date: formattedDate },
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

  async function schedulePushNotification(content) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          sound: "default",
        },
        trigger: { seconds: 1 },
      });
    } catch (error) {
      console.error("Error scheduling push notification:", error);
    }
  }

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
  
    return token;
  }
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f0f0f0", padding: 16 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </View>
      </TouchableOpacity>
      <ScrollView>
        <Text style={{ marginBottom: 8 }}>Title</Text>
        <TextInput
          style={{ backgroundColor: "white", padding: 8, borderRadius: 8, marginBottom: 16 }}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter a title*"
        />
        <Text style={{ marginBottom: 8 }}>Severity</Text>
        <View style={{ backgroundColor: "white", borderRadius: 8, marginBottom: 16 }}>
          <Picker
            selectedValue={severity}
            onValueChange={(itemValue) => setSeverity(itemValue)}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Moderate" value="Moderate" />
            <Picker.Item label="High" value="High" />
          </Picker>
        </View>

        <Text style={{ marginBottom: 8 }}>Description</Text>
        <TextInput
          style={{ backgroundColor: "white", padding: 8, borderRadius: 8, marginBottom: 16, height: 120 }}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description*"
          multiline
        />

        <Text style={{ marginBottom: 8 }}>Contact Information</Text>
        <TextInput
          style={{ backgroundColor: "white", padding: 8, borderRadius: 8, marginBottom: 16 }}
          value={contact}
          onChangeText={setContact}
          placeholder="Enter suitable contact details"
        />

        <Text style={{ marginBottom: 8 }}>Date</Text>
        <TouchableOpacity
          style={{ backgroundColor: "white", padding: 8, borderRadius: 8, marginBottom: 16 }}
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

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}>
          {selectedImages.map((image, index) => (
            <View key={index} style={{ position: "relative", margin: 4 }}>
              <Image
                source={{ uri: image.uri }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TouchableOpacity
                style={{ position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.5)", padding: 4, borderRadius: 8 }}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={{ marginBottom: 8 }}>Location</Text>
        <View style={{ height: 200, marginBottom: 16 }}>
          <MapView
            style={{ flex: 1 }}
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
          style={{ backgroundColor: "#444", padding: 16, borderRadius: 8, marginBottom: 16, alignItems: "center" }}
          onPress={submitReport}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
