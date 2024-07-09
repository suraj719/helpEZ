import { showMessage } from "react-native-flash-message";
import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from 'react-native-geolocation-service';

// Enhanced error handling in getCurrentLocation
export const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
        try {
            Geolocation.getCurrentPosition(
                position => {
                    const coords = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        heading: position.coords.heading || 0,
                    };
                    resolve(coords);
                },
                error => {
                    reject(new Error(`Failed to get location: ${error.message}`));
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            reject(new Error(`Geolocation service error: ${error.message}`));
        }
    });

// Improved error logging in locationPermission
export const locationPermission = () =>
    new Promise(async (resolve, reject) => {
        try {
            if (Platform.OS === 'ios') {
                const permissionStatus = await Geolocation.requestAuthorization('whenInUse');
                if (permissionStatus === 'granted') {
                    resolve("granted");
                } else {
                    reject('Permission not granted');
                }
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    resolve("granted");
                } else {
                    reject('Location Permission denied');
                }
            }
        } catch (error) {
            console.error('Location permission error:', error);
            reject(error);
        }
    });


export const showError = (message) => {
    showMessage({
        message,
        type: 'danger',
        icon: 'danger'
    });
};

export const showSuccess = (message) => {
    showMessage({
        message,
        type: 'success',
        icon: 'success'
    });
};
