import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import { useTranslation } from 'react-i18next';

export default function Incidents() {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);
  const fetchIncidents = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "incidents"));
    const data = snapshot.docs.map((doc) => {
      const vals = doc.data();
      const id = doc.id;
      return { id, ...vals };
    });
    setIncidents(data);
    setLoading(false);
  };
  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [])
  );
  useEffect(() => {
    fetchIncidents();
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchIncidents();
      setRefreshing(false);
    }, 100);
  }, []);
  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("IncidentDetails", { incident: item })}
      className="bg-white m-2 rounded-lg shadow-md overflow-hidden"
    >
      <Image source={{ uri: item.images[0] }} className="w-full h-40" />
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
        <Text className="text-md text-gray-600 my-1">{item.description}</Text>
        <Text className="text-sm text-gray-500">{item.date}</Text>
        <Text className="text-sm text-gray-500">Severity: {item.severity}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-gray-900 p-4 rounded m-4 items-center"
        onPress={() => navigate.navigate("ReportIncident")}
      >
        <Text className="text-white font-bold text-lg">Add an incident</Text>
      </TouchableOpacity>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : incidents.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            No incidents reported till now.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={incidents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </View>
  );
}
