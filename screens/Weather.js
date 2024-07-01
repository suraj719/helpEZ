// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import * as Location from "expo-location";
// import axios from "axios";
// import MistralClient from "@mistralai/mistralai";

// const API_KEY_OPENWEATHER = "77003d306b25e391aca3f6d95268b3ed";
// const API_KEY_MISTRAL = "A76fl5FgS8vEmyujewq3TGPUdLJ7QtWF";

// const WeatherApp = () => {
//   const client = new MistralClient(API_KEY_MISTRAL);
//   const [errorMsg, setErrorMsg] = useState(null);
//   const [suggestions, setSuggestions] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchWeather();
//   }, []);
//   const fetchWeather = async (lat, lon) => {
//     try {
//       const prompt = "helloo";
//       console.log(prompt);
//       const aiResponse = await client.chat({
//         model: "mistral-small-latest",
//         messages: [{ role: "user", content: prompt }],
//       });
//       console.log(aiResponse);
//     } catch (error) {
//       setErrorMsg("Error fetching data");
//       console.log(error);
//     }
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (errorMsg) {
//     return (
//       <View style={styles.centered}>
//         <Text>{errorMsg}</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView style={styles.container}>
//       <Text>heloo</Text>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   weatherContainer: {
//     padding: 20,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   suggestionsContainer: {
//     padding: 20,
//     backgroundColor: "#fff",
//     margin: 10,
//     borderRadius: 10,
//     elevation: 5,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   weatherText: {
//     fontSize: 18,
//     marginBottom: 5,
//   },
//   suggestionsText: {
//     fontSize: 16,
//     marginTop: 10,
//   },
// });

// export default WeatherApp;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import MistralClient from "@mistralai/mistralai";

const API_KEY_MISTRAL = "A76fl5FgS8vEmyujewq3TGPUdLJ7QtWF";

const WeatherApp = () => {
  const client = new MistralClient(API_KEY_MISTRAL);
  const [errorMsg, setErrorMsg] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const prompt = "helloo";
      console.log(prompt);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      const aiResponse = await client.chat({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log(aiResponse);
    } catch (error) {
      if (error.name === "AbortError") {
        setErrorMsg("Request timed out");
      } else {
        setErrorMsg("Error fetching data");
      }
      console.log(error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Text>heloo</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WeatherApp;
