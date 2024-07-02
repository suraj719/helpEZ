import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MistralClient from "@mistralai/mistralai";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import Forecast from "./Forecast";

const API_KEY_OPENWEATHER = "77003d306b25e391aca3f6d95268b3ed";
const API_KEY_MISTRAL = "A76fl5FgS8vEmyujewq3TGPUdLJ7QtWF";

const Weather = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Toast.show({
          type: "error",
          text1: "Turn on the location and give access to location",
        });
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      if (location) {
        const { latitude, longitude } = location.coords;
        fetchWeather(latitude, longitude);
      }
    })();
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY_OPENWEATHER}`
      );
      setWeather(weatherResponse.data);

      const client = new MistralClient(API_KEY_MISTRAL);
      const { name, main, weather: weatherDetails } = weatherResponse.data;
      const prompt = `Provide detailed insights and suggestions for the current weather in ${name}:
      - Temperature: ${Math.round(main.temp - 273.15)}°C
      - Humidity: ${main.humidity}%
      - Condition: ${weatherDetails[0].description}
      - Wind Speed: ${weatherResponse.data.wind.speed} m/s`;

      const aiResponse = await client.chat({
        model: "mistral-tiny",
        messages: [{ role: "user", content: prompt }],
      });
      setSuggestions(aiResponse.choices[0].message.content);
    } catch (error) {
      setErrorMsg("Error fetching data");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <ScrollView horizontal={false} className="flex-1 bg-gray-100">
      {showForecast ? (
        <>
          <Forecast location={location.coords} setShowForecast={setShowForecast} />
        </>
      ) : (
        <>
          <View className="p-5 bg-white m-3 rounded-lg shadow-lg">
            <Text className="text-2xl font-bold mb-3">
              Current Weather in {weather.name}
            </Text>
            <View className="flex-row items-center mb-2">
              <Ionicons name="thermometer" size={24} color="black" />
              <Text className="text-lg ml-2">
                Temperature: {Math.round(weather.main.temp - 273.15)}°C
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="water" size={24} color="black" />
              <Text className="text-lg ml-2">
                Humidity: {weather.main.humidity}%
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="partly-sunny" size={24} color="black" />
              <Text className="text-lg ml-2">
                Condition: {weather.weather[0].description}
              </Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="speedometer" size={24} color="black" />
              <Text className="text-lg ml-2">
                Wind Speed: {weather.wind.speed} m/s
              </Text>
            </View>
          </View>
          <View className="m-3 items-center">
            <TouchableOpacity
              onPress={() => setShowForecast(true)}
              className="bg-black w-4/5 p-4 rounded-lg items-center shadow-lg"
              activeOpacity={0.7}
            >
              <Text className="text-white text-base font-bold">
                View Forecasting
              </Text>
            </TouchableOpacity>
          </View>
          <View className="p-5 bg-white m-3 rounded-lg shadow-lg">
            <Text className="text-lg mt-2">{suggestions}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Weather;
