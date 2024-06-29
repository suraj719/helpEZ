import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
import Register from "./src/Register";

export default App = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Register />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f0f0f0",
  },
});
