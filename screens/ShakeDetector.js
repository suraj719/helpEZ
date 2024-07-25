import React, { useEffect, useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import Family from './Family';

const ShakeDetector = () => {
  const [subscription, setSubscription] = useState(null);
  const [shakeDetected, setShakeDetected] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Function to handle accelerometer data
    const handleAccelerometerData = ({ x, y, z }) => {
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      
      // Check if the device is shaken
      if (acceleration > 2.5) {
        if (!shakeDetected) {
          setShakeDetected(true);
          // Navigate to Family.js
          navigation.navigate('ReportIncident'); 
        }
      } else {
        setShakeDetected(false);
      }
    };

    // Subscribe to accelerometer updates
    const subscription = Accelerometer.addListener(handleAccelerometerData);
    setSubscription(subscription);

    // Clean up the subscription when the component unmounts
    return () => subscription && subscription.remove();
  }, [shakeDetected, navigation]);

  return (
    <View>
     
    </View>
  );
};

export default ShakeDetector;
