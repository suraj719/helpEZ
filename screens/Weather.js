import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MistralClient from "@mistralai/mistralai";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { weatherIconMap } from "../utils/weatherIcons";
const API_KEY_OPENWEATHER = "77003d306b25e391aca3f6d95268b3ed";
const API_KEY_MISTRAL = "A76fl5FgS8vEmyujewq3TGPUdLJ7QtWF";

const Weather = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
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
        fetchForecast(latitude, longitude);
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
  };
  const fetchForecast = async (lat, lon) => {
    try {
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + 5);
      const params = {
        latitude: lat,
        longitude: lon,
        current: ["temperature_2m", "rain"],
        start_date: currentDate.toISOString().split("T")[0],
        end_date: futureDate.toISOString().split("T")[0],
        daily: ["temperature_2m_max", "temperature_2m_min", "weather_code"],
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
          weather_code: daily.weather_code || [],
        },
      };
      setForecast(formattedWeatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
    setLoading(false);
  };
  const formatUnixTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    return `${hours}:${minutes} ${ampm}`;
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
    <ScrollView horizontal={false} className="flex-1 p-4 bg-gray-100">
      <View className="my-4 p-4 rounded-lg shadow-lg bg-white">
        <Text className="text-center font-bold text-5xl text-gray-800">
          {Math.round(weather.main.temp - 273.15)}°C
        </Text>
        <Text className="text-center text-2xl font-semibold text-gray-600 mt-2">
          {weather.name}
        </Text>
        <View className="flex-row justify-center gap-3 mt-3">
          <Text className="text-lg text-gray-600">
            {forecast.daily.temperature2mMin[0]}°C {"~"}
            {forecast.daily.temperature2mMax[0]}°C
          </Text>
        </View>
        <Text className="text-center text-lg text-gray-600 mt-2">
          Description: {weather.weather[0].description}
        </Text>
      </View>

      <View className="flex-row gap-4 flex-wrap justify-evenly p-2">
        <View className="flex min-w-[40%] flex-1 flex-col gap-2 rounded-xl p-4 bg-white shadow">
          <Text className="text-gray-700 text-lg font-medium leading-normal">
            Sunrise
          </Text>
          <Text className="text-gray-900 text-2xl font-bold leading-tight">
            {formatUnixTimestamp(weather.sys.sunrise)}
          </Text>
        </View>
        <View className="flex min-w-[40%] flex-1 flex-col gap-2 rounded-xl p-4 bg-white shadow">
          <Text className="text-gray-700 text-lg font-medium leading-normal">
            Sunset
          </Text>
          <Text className="text-gray-900 text-2xl font-bold leading-tight">
            {formatUnixTimestamp(weather.sys.sunset)}
          </Text>
        </View>
        <View className="flex min-w-[40%] flex-1 flex-col gap-2 rounded-xl p-4 bg-white shadow">
          <Text className="text-gray-700 text-lg font-medium leading-normal">
            Wind
          </Text>
          <Text className="text-gray-900 text-2xl font-bold leading-tight">
            {weather.wind.speed} m/s
          </Text>
        </View>
        <View className="flex min-w-[40%] flex-1 flex-col gap-2 rounded-xl p-4 bg-white shadow">
          <Text className="text-gray-700 text-lg font-medium leading-normal">
            Humidity
          </Text>
          <Text className="text-gray-900 text-2xl font-bold leading-tight">
            {weather.main.humidity}%
          </Text>
        </View>
      </View>

      <View className="m-3">
        {/* <Text className="text-xl font-bold mb-3">5 daysForecast</Text> */}
        <FlatList
          data={forecast.daily.time.slice(1, 6)}
          scrollEnabled={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View className="flex-row items-center bg-white justify-between mb-3 rounded-lg p-3 shadow">
              <View className="flex-row items-center gap-4">
                <View className="flex items-center justify-center rounded-lg bg-gray-200 shrink-0 size-10 p-2">
                  <Icon
                    name={
                      weatherIconMap[forecast.daily.weather_code[index + 1]] ||
                      "weather-cloudy"
                    }
                    size={24}
                    color="#000"
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-700">
                  {new Date(item).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </Text>
              </View>
              <Text className="text-lg font-bold text-gray-700">
                {forecast.daily.temperature2mMin[index + 1]}°C ~{" "}
                {forecast.daily.temperature2mMax[index + 1]}°C
              </Text>
            </View>
          )}
        />
      </View>

      <View className="p-4 bg-white m-3 rounded-lg shadow-lg">
        <Text className="text-lg text-gray-700 mt-2">{suggestions}</Text>
      </View>
    </ScrollView>
  );
};

export default Weather;
