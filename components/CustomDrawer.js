import React from "react";
import { View, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

const CustomDrawer = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Logout"
          onPress={() => props.navigation.navigate("Logout")}
          style={styles.logoutItem}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  logoutContainer: {
    flex: 1,
    // justifyContent: "flex-end",
    paddingBottom: 20,
  },
  logoutItem: {
    backgroundColor: "#f8f8f8",
  },
});

export default CustomDrawer;
