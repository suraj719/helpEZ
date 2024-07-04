import React, { useState, useEffect } from "react";
import { View, FlatList, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Updates() {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Tornado Outbreak in the Midwest",
      description:
        "A severe tornado outbreak affected multiple states including Georgia, Illinois, Indiana, Kansas, Kentucky, Missouri, Oklahoma, and Ohio. Significant damage was reported with several fatalities.",
      date: "2024-03-14",
      images: [
        "https://www.usatoday.com/gcdn/authoring/authoring-images/2024/05/18/USAT/73747520007-hawley-tornado.jpg",
        "https://www.usatoday.com/gcdn/authoring/authoring-images/2024/06/04/USAT/73966504007-storm-chasers.JPG",
      ],
      location: {
        latitude: 39.7684,
        longitude: -86.1581,
      },
      severity: "High",
      contact: "Midwest Disaster Response: 800-123-4567",
    },
    {
      id: "2",
      title: "Flooding in Kentucky",
      description:
        "Severe flooding caused by heavy rains resulted in significant property damage and displacement of residents in Kentucky.",
      date: "2024-05-06",
      images: [
        "https://www.naco.org/sites/default/files/articles/Kentucky%20flooding.jpeg",
        "https://cdn.outsideonline.com/wp-content/uploads/2022/09/Kentucky-Flooding-S.jpg",
      ],
      location: {
        latitude: 37.8393,
        longitude: -84.27,
      },
      severity: "Moderate",
      contact: "Kentucky Emergency Management: 859-123-4567",
    },
    {
      id: "3",
      title: "Hurricane in Texas",
      description:
        "A powerful hurricane hit the Texas coast, causing widespread destruction, power outages, and numerous casualties.",
      date: "2024-06-15",
      images: [
        "https://www.caller.com/gcdn/authoring/authoring-images/2024/07/03/USAT/74288533007-2159762202.jpg",
        "https://bsmedia.business-standard.com/_media/bs/img/article/2018-06/27/full/1530123752-1095.jpg",
      ],
      location: {
        latitude: 29.4241,
        longitude: -98.4936,
      },
      severity: "High",
      contact: "Texas Emergency Operations Center: 512-123-4567",
    },
  ]);

  const navigation = useNavigation();
  // const db = getFirestore(app);

  //   useEffect(() => {
  //     const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
  //       const eventsData = snapshot.docs.map((doc) => ({
  //         id: doc.id,
  //         ...doc.data(),
  //       }));
  //       setEvents(eventsData);
  //     });
  //     return () => unsubscribe();
  //   }, []);

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
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
    <SafeAreaView className="flex-1 -mt-5 bg-gray-100">
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 8 }}
      />
    </SafeAreaView>
  );
}