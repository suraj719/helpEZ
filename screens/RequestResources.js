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
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import MapView, { Marker } from "react-native-maps";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import app from "../utils/firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { addDoc, collection, getFirestore, getDocs, query, where, updateDoc, doc  } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from "@google/generative-ai";


export default function RequestResources() {
  const { t } = useTranslation();
  const storage = getStorage(app);
  const db = getFirestore(app);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [requestTitle, setRequestTitle] = useState("");
  const [description, setAdditionalInfo] = useState("");
  const [neededBy, setNeededBy] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [items, setItems] = useState([{ itemName: '', itemQuantity: '',satisfied: '0' }]);


  const apiKey = "AIzaSyAcZr3HgQhrwfX2M9U8XnTdWpnV_7fiMf8";
  const genAI = new GoogleGenerativeAI(apiKey);

  useEffect(() => {
    (async () => {
      await fetchUserLocation();
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTitle("");
      setSeverity("Low");
      setRequestTitle("");
      setAdditionalInfo("");
      setNeededBy(new Date());
      setSelectedImages([]);
      setItems([{ itemName: '', itemQuantity: '' , satisfied: '0'}]);
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

  const classifyText = async (description, type) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              { text: `You're a seasoned classifier, trained to identify and categorize various ${type}s based on their descriptions. Your task is to provide accurate classifications to help streamline response efforts. Provide a single-word category for each ${type} description.` },
            ],
          },
          {
            role: "model",
            parts: [
              { text: `Understood. I'll provide the single-word classification for each ${type} you describe. Bring on the descriptions!` },
            ],
          },
          {
            "role": "model",
            "parts": [
              { text: `You're right to ask!  Here are the fixed set of categories I'm currently using to classify incidents and requests:\n\n**For Incidents:**\n\n* Natural\n* Accident\n* Medical\n* Violent\n* Environmental\n* Technological\n* Social\n* Transportation\n* Animal\n* Miscellaneous\n\n**For Requests:**\n\n* Medical\n* Food Resources\n* Clothing\n* Technical Support\n* Rescue and Safety\n* Shelter and Housing\n* Transportation\n* Hygiene and Sanitation\n\nI'm open to expanding these categories as we go, but for now, these are the ones I'm using.  Let me know if you'd like to add or adjust these categories as we move forward! \n` },
            ],
          },
          {
            role: "user",
            parts: [
              { text: 
                   `Request Categories and Training Prompts
Medical:

Prompt: "Classify this request as a Medical request if the description involves the need for medical attention, supplies, or health-related assistance."
Example: "Urgent need for medical supplies for injured victims."

Food Resources:

Prompt: "Classify this request as a Food Resources request if the description involves the need for food, water, or nutrition-related assistance."
Example: "Requesting food and clean water for a community affected by the disaster."

Clothing:

Prompt: "Classify this request as a Clothing request if the description involves the need for clothes, blankets, or similar items."
Example: "Need warm clothing for families displaced by the flood."

Technical Support:

Prompt: "Classify this request as a Technical Support request if the description involves the need for technical assistance, equipment, or services."
Example: "Requesting technical support to restore communication lines."

Rescue and Safety:

Prompt: "Classify this request as a Rescue and Safety request if the description involves rescue operations, safety measures, or evacuation assistance."
Example: "Requesting evacuation assistance due to flooding."

Shelter and Housing:

Prompt: "Classify this request as a Shelter and Housing request if the description involves the need for temporary shelter, housing assistance, or relocation support."
Example: "Need temporary shelter for a family displaced by a fire."

Transportation:

Prompt: "Classify this request as a Transportation request if the description involves the need for transportation services, vehicle support, or travel assistance."
Example: "Requesting transportation to a medical facility."

Hygiene and Sanitation:

Prompt: "Classify this request as a Hygiene and Sanitation request if the description involves the need for hygiene products, sanitation facilities, or cleaning supplies."
Example: "Need sanitation supplies for a temporary shelter."
` },
            ],
          },
        ],
      });

      const result = await chatSession.sendMessage(description);
      const category = result.response?.text?.();

      if (!category) {
        throw new Error("No category returned from Generative AI model");
      }

      return category.trim();
    } catch (error) {
      console.error("Error classifying text: ", error);
      return "Unknown";
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

      if (!result.canceled) {
        setSelectedImages([...selectedImages, result.assets[0]]);
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

  const submitRequest = async () => {
    if (!requestTitle || !neededBy) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }
    const imageUrls = await uploadImagesToStorage();
    const formattedDate = neededBy.toISOString().split("T")[0];
    const category = await classifyText(description, "requests");
    const reportData = {
      location,
      severity,
      category,
      requestTitle,
      contact: await AsyncStorage.getItem("phoneNumber"),
      description,
      neededBy: formattedDate,
      sendAlert: false,
      items,
      images: imageUrls,
    };

    const reportData2 = {
      items,
      sendAlert: false,
    };

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "requests"), reportData);
      console.log("Document written with ID: ", docRef.id);
  
      const existingItemsQuery = query(collection(db, "requestResources"), reportData2);
      const existingItemsSnapshot = await getDocs(existingItemsQuery);
  
      const existingItems = existingItemsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      for (const item of items) {
        const existingItem = existingItems.find(
          (existing) => existing.itemName === item.itemName
        );
  
        if (existingItem) {
          const updatedQuantity =
            parseInt(existingItem.itemQuantity) + parseInt(item.itemQuantity);
          await updateDoc(doc(db, "requestResources", existingItem.id), {
            itemQuantity: updatedQuantity.toString(),
          });
        } else {
          await addDoc(collection(db, "requestResources"), item);
        }
      }
  
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

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { itemName: '', itemQuantity: '' , satisfied: '0'}]);
  };

  const removeItem = (index) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity className="mb-4" onPress={() => navigation.goBack()}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </View>
      </TouchableOpacity>
      <ScrollView>
        <Text className="text-md font-semibold mb-4">
          Request Resources that you need and we will get back to you with a good news!!
        </Text>
        <Text className="mb-2">Request Title</Text>
        <TextInput
          className="bg-white p-2 rounded mb-4 h-20"
          value={requestTitle}
          onChangeText={setRequestTitle}
          placeholder="Enter your request title*"
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
          value={description}
          onChangeText={setAdditionalInfo}
          placeholder="Enter any additional information"
        />
        <Text className="mb-2">Items</Text>
        {items.map((item, index) => (
          <View key={index} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: "white", padding: 10, borderRadius: 5 }}
              value={item.itemName}
              onChangeText={(value) => handleItemChange(index, 'itemName', value)}
              placeholder="Item Name"
            />
            <TextInput
              style={{ flex: 1, backgroundColor: "white", padding: 10, borderRadius: 5, marginLeft: 10 }}
              value={item.itemQuantity}
              onChangeText={(value) => handleItemChange(index, 'itemQuantity', value)}
              placeholder="Quantity"
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={24} color="red" style={{ marginLeft: 10 }} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          onPress={addItem}
          style={{ backgroundColor: '#4B4B4B', padding: 10, borderRadius: 5, marginTop: 20, alignSelf: 'flex-end' }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>Add Item</Text>
        </TouchableOpacity>

        <Text className="mb-2">Needed By</Text>
        <TouchableOpacity
          className="bg-white p-2 rounded mb-4"
          onPress={showDatePicker}
        >
          <Text>{neededBy.toISOString().split("T")[0]}</Text>
        </TouchableOpacity>

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
          <Text className="text-black text-center ml-2">Take a Photo</Text>
        </TouchableOpacity>

        <View
          style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16 }}
        >
          {selectedImages.map((image, index) => (
            <View key={index} style={{ position: "relative", margin: 4 }}>
              <Image
                source={{ uri: image.uri }}
                style={{ width: 100, height: 100, borderRadius: 8 }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: 4,
                  borderRadius: 8,
                }}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
