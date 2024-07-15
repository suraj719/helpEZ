import * as Linking from 'expo-linking';
import { Button, View } from 'react-native';
import React from 'react';

export default function FlutterLink() {
  const openFlutterApp = () => {
    const url = 'bridgefysample://open';
    Linking.openURL(url).catch(err => console.error('Error:', err));
  };

  return (
    <View>
      <Button title="Open Flutter App" onPress={openFlutterApp} />
    </View>
  );
}
