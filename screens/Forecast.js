import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

const Weather = ({ location, setShowForecast }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [floodData, setFloodData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 7);

        const params = {
          latitude: location.latitude,
          longitude: location.longitude,
          current: ["temperature_2m", "rain"],
          start_date: currentDate.toISOString().split("T")[0],
          end_date: futureDate.toISOString().split("T")[0],
          daily: ["temperature_2m_max", "temperature_2m_min"],
        };

        const url = "https://api.open-meteo.com/v1/forecast";
        const response = await axios.get(url, { params });

        const utcOffsetSeconds = response.data.utcOffsetSeconds || 0;
        const current = response.data.current || {};
        const daily = response.data.daily || {};

        const formattedWeatherData = {
          current: {
            time: new Date((Number(current.time) + utcOffsetSeconds) * 1000),
            temperature2m: Number(current.temperature_2m).toFixed(2),
            rain: current.rain,
          },
          daily: {
            time: daily.time || [],
            temperature2mMax: daily.temperature_2m_max || [],
            temperature2mMin: daily.temperature_2m_min || [],
          },
        };
        setWeatherData(formattedWeatherData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const fetchFloodData = async () => {
      try {
        const currentDate = new Date();
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + 7);

        const params = {
          latitude: location.latitude,
          longitude: location.longitude,
          start_date: currentDate.toISOString().split("T")[0],
          end_date: futureDate.toISOString().split("T")[0],
          daily: "river_discharge",
        };

        const url = "https://flood-api.open-meteo.com/v1/flood";
        const response = await axios.get(url, { params });

        const formattedFloodData = {
          time: response.data.daily.time || [],
          riverDischarge: response.data.daily.river_discharge || [],
        };
        setFloodData(formattedFloodData);
      } catch (error) {
        console.error("Error fetching flood data:", error);
      }
    };

    fetchWeatherData();
    fetchFloodData();
  }, []);

  if (!weatherData || !floodData) {
    return (
      <View className="flex-1 h-screen justify-center items-center">
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4 bg-white">
      <TouchableOpacity className="mb-2" onPress={() => setShowForecast(false)}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>back</Text>
        </View>
      </TouchableOpacity>
      <View>
        <FlatList
          data={weatherData.daily.time}
          scrollEnabled={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View className="bg-gray-100 p-4 rounded-lg mb-4">
              <Text className="text-lg mb-2">
                Date: {new Date(item).toLocaleDateString("en-GB")}
              </Text>
              <Text className="text-lg mb-2">
                Max Temperature: {weatherData.daily.temperature2mMax[index]}°C
              </Text>
              <Text className="text-lg mb-2">
                Min Temperature: {weatherData.daily.temperature2mMin[index]}°C
              </Text>
              {/* <Text className="text-lg mb-2 text-green-600"> */}
              <Text className="text-lg mb-2">
                River Discharge: {floodData.riverDischarge[index]} m³/s
              </Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default Weather;
