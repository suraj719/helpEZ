import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import { GOOGLE_MAP_KEY } from './googleMapKey';
import imagePath from './imagePath';
import MapViewDirections from 'react-native-maps-directions';
import Loader from './Loader';
import { locationPermission, getCurrentLocation } from './helperFunction';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ResourceRouteScreen = ({ route }) => {
    const { t } = useTranslation();
    const mapRef = useRef();
    const markerRef = useRef();

    const [state, setState] = useState({
        curLoc: { latitude: 18.3197, longitude: 78.3506 },
        destinationCords: route.params.destinationCords || {}, // Get destination coordinates from navigation params
        isLoading: false,
        coordinate: new AnimatedRegion({
            latitude: 18.3197, longitude: 78.3506,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        time: 0,
        distance: 0,
        heading: 0
    });

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading } = state;

    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    useEffect(() => {
        getLiveLocation();
    }, []);

    const getLiveLocation = async () => {
        const locPermissionDenied = await locationPermission();
        if (locPermissionDenied) {
            const { latitude, longitude, heading } = await getCurrentLocation();
            animate(latitude, longitude);
            updateState({
                heading: heading,
                curLoc: { latitude, longitude },
                coordinate: new AnimatedRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                })
            });
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    };

    const onCenter = () => {
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    };

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        });
    };

    return (
        <View style={styles.container}>
            {distance !== 0 && time !== 0 && (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                    <Text>Time left: {time.toFixed(0)} mins</Text>
                    <Text>Distance left: {distance.toFixed(0)} km</Text>
                </View>
            )}
            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        ...curLoc,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    }}
                >
                    <Marker.Animated
                        ref={markerRef}
                        coordinate={coordinate}
                    >
                        <Image
                            source={imagePath.icBike}
                            style={{
                                width: 40,
                                height: 40,
                                transform: [{ rotate: `${heading}deg` }]
                            }}
                            resizeMode="contain"
                        />
                    </Marker.Animated>

                    {Object.keys(destinationCords).length > 0 && (
                        <Marker
                            coordinate={destinationCords}
                            image={imagePath.icGreenMarker}
                        />
                    )}

                    {Object.keys(destinationCords).length > 0 && (
                        <MapViewDirections
                            origin={curLoc}
                            destination={destinationCords}
                            apikey={GOOGLE_MAP_KEY}
                            strokeWidth={6}
                            strokeColor="red"
                            optimizeWaypoints={true}
                            onStart={(params) => {
                                console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                            }}
                            onReady={result => {
                                console.log(`Distance: ${result.distance} km`)
                                console.log(`Duration: ${result.duration} min.`)
                                fetchTime(result.distance, result.duration);
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        // Adjust padding as needed
                                    },
                                });
                            }}
                            onError={(errorMessage) => {
                                console.log('Error:', errorMessage);
                            }}
                        />
                    )}
                </MapView>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}
                    onPress={onCenter}
                >
                    <Image source={imagePath.greenIndicator} />
                </TouchableOpacity>
            </View>
            <View style={styles.bottomCard}>
                <Text></Text>
                {/* Implement choose location button functionality if needed */}
            </View>
            <Loader isLoading={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomCard: {
        backgroundColor: 'white',
        width: '100%',
        padding: 30,
        borderTopEndRadius: 24,
        borderTopStartRadius: 24
    }
});

export default ResourceRouteScreen;
