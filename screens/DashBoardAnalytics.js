import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Text, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDocs, getFirestore, doc, updateDoc } from "firebase/firestore";
import app from "../utils/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from "react-i18next";

const apiKey = "AIzaSyAcZr3HgQhrwfX2M9U8XnTdWpnV_7fiMf8";
const genAI = new GoogleGenerativeAI(apiKey);

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

      const incidentData = await Promise.all(
        incidentSnapshot.docs.map(async (doc) => {
          const vals = doc.data();
          const id = doc.id;
          const category = await classifyText(vals.description, "incident");

          if (category) {
            await updateFirestoreDocument("incidents", id, { category });
          }

          return { id, ...vals, category };
        })
      );

      const requestData = await Promise.all(
        requestSnapshot.docs.map(async (doc) => {
          const vals = doc.data();
          const id = doc.id;
          const category = await classifyText(vals.requestDescription, "request");

          // Update Firestore document with category
          if (category) {
            await updateFirestoreDocument("requests", id, { category });
          }

          return { id, ...vals, category };
        })
      );

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
//Model for classifying incidents and requests
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
              { text: type === "incident" ? 
                  `Incident Categories and Training Prompts
Natural Calamities:

Prompt: "Classify this incident as a natural calamity if the description involves events like earthquakes, floods, hurricanes, wildfires, or tsunamis."
Example: "A devastating earthquake struck the region, causing widespread damage and displacement."
Accidents:

Prompt: "Classify this incident as an accident if the description involves unforeseen events leading to injury, damage, or loss."
Example: "A car collision on the highway resulted in multiple injuries and traffic congestion."
Medical Emergencies:

Prompt: "Classify this incident as a medical emergency if the description involves urgent medical attention needed due to illness, injury, or health crisis."
Example: "An elderly person collapsed due to a suspected heart attack, requiring immediate medical assistance."
Violent Incidents:

Prompt: "Classify this incident as a violent incident if the description involves criminal activities, assaults, or public disturbances."
Example: "A brawl broke out in the city square, leading to multiple injuries and arrests."
Environmental Issues:

Prompt: "Classify this incident as an environmental issue if the description involves pollution, environmental degradation, or ecological concerns."
Example: "Toxic waste leakage from a factory contaminated nearby water sources, endangering wildlife."
Technological Failures:

Prompt: "Classify this incident as a technological failure if the description involves failures in infrastructure, utilities, or technological systems."
Example: "A major power outage affected several neighborhoods, disrupting daily life and services."
Social Issues:

Prompt: "Classify this incident as a social issue if the description involves protests, demonstrations, or social unrest."
Example: "Mass protests erupted in the capital demanding political reforms and social justice."
Transportation Issues:

Prompt: "Classify this incident as a transportation issue if the description involves accidents, delays, or disruptions in transportation services."
Example: "A subway train derailment caused delays during rush hour, affecting thousands of commuters."
Animal Incidents:

Prompt: "Classify this incident as an animal incident if the description involves incidents related to wildlife, pets, or animal attacks."
Example: "A bear sighting in a residential area prompted authorities to issue a wildlife alert."
Miscellaneous Incidents:

Prompt: "Classify this incident as miscellaneous if the description does not fit into any specific category but requires attention or action."
Example: "A large-scale public event caused traffic congestion and noise disturbances in the neighborhood."
` : `Request Categories and Training Prompts
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

  // Update Firestore document function
  const updateFirestoreDocument = async (collectionName, docId, data) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating Firestore document: ", error);
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

        //Displaying the incidents and requests based on generated category
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
