import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import Carousel from "react-native-reanimated-carousel";

export default function IncidentDetails({ route }) {
  const navigation = useNavigation();
  const { incident } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openModal = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalVisible(false);
  };
  const width = Dimensions.get("window").width;
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <TouchableOpacity
        className="m-3 mt-4"
        onPress={() => navigation.goBack()}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </View>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-lg shadow-md mb-4">
          {incident?.images?.length > 0 && (
            <View style={{ flex: 1 }}>
              {incident.images.length === 1 ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => openModal(incident.images[0])}
                    // className="w-1/2 p-1"
                  >
                    <Image
                      width={700}
                      height={500}
                      source={{ uri: incident.images[0] }}
                      className="w-full h-40 rounded-lg"
                      style={{ resizeMode: "cover" }}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Carousel
                    // loop
                    width={700}
                    height={170}
                    data={incident.images}
                    renderItem={({ index }) => (
                      <View>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          key={index}
                          onPress={() => openModal(incident.images[index])}
                          className="w-1/2 p-1"
                        >
                          <Image
                            source={{ uri: incident.images[index] }}
                            className="w-full h-40"
                            style={{ resizeMode: "cover" }}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </>
              )}
            </View>
          )}
          <View className="p-3">
            <Text className="text-2xl font-bold mb-2 text-gray-800">
              {incident.title}
            </Text>
            <Text className="text-base mb-2 text-gray-600">
              {incident.description}
            </Text>
            <Text className="text-sm mb-2 text-gray-500">
              Date: {incident.date}
            </Text>
            <Text className="text-sm mb-2 text-gray-500">
              Severity: {incident.severity}
            </Text>
            {incident?.contact && (
              <Text className="text-sm mb-2 text-gray-500">
                Contact: {incident.contact}
              </Text>
            )}
          </View>
        </View>
        {/* <Text className="font-bold text-xl">Location</Text> */}
        <View className="rounded-lg bg-white p-1 mb-4">
          <MapView
            className="w-full h-60"
            initialRegion={{
              latitude: incident.location.latitude,
              longitude: incident.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: incident.location.latitude,
                longitude: incident.location.longitude,
              }}
              title={incident.title}
              description={incident.description}
            />
          </MapView>
        </View>
        <View className="mb-4">
          <Text className="font-bold text-xl mb-2">Recommended Actions</Text>
          {/* <View className="bg-white p-4 rounded-lg shadow-md"> */}
          <Text>Secure loose outdoor items. Take in or tie down...</Text>
          {/* </View> */}
        </View>

        <Modal visible={modalVisible} transparent={true}>
          <View className="flex-1 bg-black bg-opacity-80 justify-center items-center">
            {selectedImage && (
              <View className="w-11/12 h-5/6 relative">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-full rounded-lg"
                  style={{ resizeMode: "contain" }}
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 z-10"
                  activeOpacity={0.7}
                  onPress={closeModal}
                >
                  <Ionicons
                    name="close-circle-outline"
                    color="white"
                    size={30}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
