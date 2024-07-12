import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Requests() {
  const navigate = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        const q = query(
          collection(getFirestore(app), "requests"),
          where("contact", "==", phoneNumber)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const vals = doc.data();
          const id = doc.id;
          return { id, ...vals };
        });
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchRequests();
      setRefreshing(false);
    }, 100);
  }, []);
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      //   onPress={() => navigate.navigate("RequestDetails", { request: item })}
      className="bg-white m-2 rounded-lg shadow-md overflow-hidden"
    >
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">
          {item.requestTitle}
        </Text>
        {item?.requestDescription && (
          <Text className="text-sm text-gray-600 my-1">
            Additional Info: {item.requestDescription}
          </Text>
        )}
        <Text className="text-sm text-gray-500">
          Needed By: {item.neededBy}
        </Text>
        <Text className="text-sm text-gray-500">
          Location: {item.location.latitude}, {item.location.longitude}
        </Text>
        <Text className="text-sm text-gray-500">Severity: {item.severity}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-gray-900 p-4 rounded m-4 items-center"
        onPress={() => navigate.navigate("RequestResources")}
      >
        <Text className="text-white font-bold text-lg">Add a Request</Text>
      </TouchableOpacity>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            You haven't requested anything yet!!
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </View>
  );
}
