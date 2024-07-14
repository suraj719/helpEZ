import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Logout() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("phoneNumber");
      await AsyncStorage.removeItem("name");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Register" }],
        })
      );
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 p-5">
      <Text className="text-lg font-medium text-center mb-5 text-gray-800">
        Are you sure you want to logout?
      </Text>
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-black w-4/5 p-4 rounded-lg items-center shadow-lg"
        activeOpacity={0.7}
      >
        <Text className="text-white text-base font-bold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
