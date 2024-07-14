import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import ResourceCard from "./ResourceCard";

const ResourcesTrackingScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Sample data for demonstration
  const resourcesData = [
    {
      title: t('resource1.title'),
      fromLocation: t('resource1.fromLocation'),
      toLocation: t('resource1.toLocation'),
      truckStartedTime: "2024-07-10 10:00 AM",
    },
    {
      title: t('resource2.title'),
      fromLocation: t('resource2.fromLocation'),
      toLocation: t('resource2.toLocation'),
      truckStartedTime: "2024-07-11 11:00 AM",
    },
    // Add more resource data as needed
  ];

  const handleResourceCardPress = (resource) => {
    navigation.navigate('ResourceRouteScreen', {
      curLoc: { latitude: 18.3197, longitude: 78.3506 },
      destinationCords: { latitude: 17.3850, longitude: 78.4867 }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {resourcesData.map((resource, index) => (
        <TouchableOpacity key={index} onPress={() => handleResourceCardPress(resource)}>
          <ResourceCard
            title={resource.title}
            fromLocation={resource.fromLocation}
            toLocation={resource.toLocation}
            truckStartedTime={resource.truckStartedTime}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default ResourcesTrackingScreen;
