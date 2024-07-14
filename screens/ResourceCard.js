import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const ResourceCard = ({ title, fromLocation, toLocation, truckStartedTime }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon name="truck" size={22} color="#000" />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>
        <Text>From: {fromLocation}</Text>
        <Text>To: {toLocation}</Text>
        <Text>Truck Started Time: {truckStartedTime}</Text>
        {/* Add additional fields as needed */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  content: {},
});

export default ResourceCard;
