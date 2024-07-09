import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import ResourceCard from "./ResourceCard"; // Import ResourceCard component

const ResourcesTrackingScreen = () => {
  // Sample data for demonstration
  const resourcesData = [
    {
      title: "Resource 1",
      fromLocation: "Location A",
      toLocation: "Location B",
      truckStartedTime: "2024-07-10 10:00 AM",
    },
    {
      title: "Resource 2",
      fromLocation: "Location C",
      toLocation: "Location D",
      truckStartedTime: "2024-07-11 11:00 AM",
    },
    // Add more resource data as needed
  ];

  return (
    <ScrollView style={styles.container}>
      {resourcesData.map((resource, index) => (
        <ResourceCard
          key={index}
          title={resource.title}
          fromLocation={resource.fromLocation}
          toLocation={resource.toLocation}
          truckStartedTime={resource.truckStartedTime}
        />
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
