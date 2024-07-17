import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function Incidents() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const categories = [
    "All",
    "Natural",
    "Accident",
    "Medical",
    "Environmental",
    "Technological",
    "Miscellaneous",
  ];
  const db = getFirestore(app);

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

  const filteredIncidents =
    selectedCategory !== "All"
      ? incidents.filter((incident) => incident.category === selectedCategory)
      : incidents;
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "text-red-600";
      case "Moderate":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("IncidentDetails", { incident: item })}
      className="bg-white m-2 rounded-lg shadow-md overflow-hidden"
    >
      {item?.images?.length > 0 ? (
        <>
          <View className="flex flex-row items-center justify-between p-4">
            <View className="w-[65%] pr-4">
              <Text className="text-lg font-bold text-gray-800">
                {item.title}
              </Text>
              <Text numberOfLines={2} className="text-md text-gray-600 my-1">
                {item.description}
              </Text>
              <Text
                className={`text-sm font-semibold ${getSeverityColor(
                  item.severity
                )}`}
              >
                Severity: {item.severity}
              </Text>
            </View>
            <Image
              source={{ uri: item.images[0] }}
              style={{ resizeMode: "cover" }}
              className="w-[35%] h-24 rounded-lg"
            />
          </View>
        </>
      ) : (
        <>
          <View className="flex flex-row items-center justify-between p-4">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold text-gray-800">
                {item.title}
              </Text>
              <Text numberOfLines={2} className="text-md text-gray-600 my-1">
                {item.description}
              </Text>
              <Text
                className={`text-sm font-semibold ${getSeverityColor(
                  item.severity
                )}`}
              >
                Severity: {item.severity}
              </Text>
            </View>
          </View>
        </>
      )}
    </TouchableOpacity>
  );

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category}
      activeOpacity={0.7}
      className={`h-[40px] m- px-4 py-2 border-b-4 ${
        selectedCategory === category ? "border-gray-900" : "border-transparent"
      }`}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        className={`text-sm font-bold ${
          selectedCategory === category ? "text-gray-900" : "text-gray-400"
        }`}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex- bg-gray-100">
      <View
        className="flex flex-row items-center justify-around "
        style={{ paddingEnd: 15 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginStart: 20 }}
          className="p-4 h-[75px] m-4 border-b-2 border-gray-200"
        >
          {categories.map(renderCategoryItem)}
        </ScrollView>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ReportIncident")}
        >
          <Icon name="plus-circle" size={28} />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View className="flex h-[70vh] justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : filteredIncidents.length === 0 ? (
        <View className="flex h-[70vh] justify-center items-center">
          <Text className="text-lg text-gray-600">
            No incidents reported in this category.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredIncidents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 2 }}
          ListFooterComponent={<View className="h-36" />}
        />
      )}
    </View>
  );
}
