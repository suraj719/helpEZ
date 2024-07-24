import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import { PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from "react-i18next";

export default function Analytics() {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("incident"); // 'incident' or 'request'
  const [incidentCategories, setIncidentCategories] = useState([]);
  const [requestCategories, setRequestCategories] = useState([]);
  const db = getFirestore(app);

  const categoryColors = {
    // Incidents
    "Natural": "green",
    "Accident": "red",
    "Medical": "blue",
    "Violent": "darkred",
    "Environmental": "lightgreen",
    "Technological": "gray",
    "Social": "teal",
    "Transportation": "brown",
    "Animal": "darkorange",
    "Miscellaneous": "lightgray",
    
    // Requests
    "Medical": "blue",
    "Food Resources": "yellow",
    "Clothing": "pink",
    "Technical Support": "darkblue",
    "Rescue and Safety": "orange",
    "Shelter and Housing": "purple",
    "Transportation": "brown",
    "Hygiene and Sanitation": "lightpink"
  };

  const getColorForCategory = (category) => categoryColors[category] || "grey";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incidentSnapshot, requestSnapshot] = await Promise.all([
        getDocs(collection(db, "incidents")),
        getDocs(collection(db, "requests"))
      ]);

      const incidentData = incidentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const requestData = requestSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setIncidents(incidentData);
      setRequests(requestData);

      const incidentCategories = [...new Set(incidentData.map(item => item.category))];
      const requestCategories = [...new Set(requestData.map(item => item.category))];
      
      setIncidentCategories(incidentCategories);
      setRequestCategories(requestCategories);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data: ", error);
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const categorizedData = selectedType === "incident" ? incidents : requests;
  const categories = selectedType === "incident" ? incidentCategories : requestCategories;

  const displayedData = selectedCategory
    ? categorizedData.filter(item => item.category === selectedCategory)
    : categorizedData;

  const pieChartData = categories.map(category => ({
    name: category,
    population: categorizedData.filter(item => item.category === category).length,
    color: getColorForCategory(category),
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  }));

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigate.navigate(selectedType === "incident" ? "IncidentDetails" : "RequestDetails", { id: item.id })}
      style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}
    >
      <Text style={{ fontWeight: "bold" }}>{selectedType === "incident" ? item.description : item.requestDescription}</Text>
      <Text>Category: {item.category}</Text>
      <Text>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={displayedData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={() => (
            <View>
              <Text style={{ fontSize: 20, textAlign: 'center', marginVertical: 20 }}>Analytics Dashboard</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setSelectedType("incident")}>
                  <Text style={{ color: selectedType === "incident" ? "blue" : "black" }}>Incidents</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedType("request")}>
                  <Text style={{ color: selectedType === "request" ? "blue" : "black" }}>Requests</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              >
                <Picker.Item label="All" value="" />
                {categories.map(category => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
              <PieChart
                data={pieChartData}
                width={Dimensions.get('window').width}
                height={220}
                chartConfig={{
                  backgroundColor: '#1cc910',
                  backgroundGradientFrom: '#eff3ff',
                  backgroundGradientTo: '#efefef',
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}
        />
      )}
    </View>
  );
}
