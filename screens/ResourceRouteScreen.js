import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GOOGLE_MAP_KEY } from '../constants/googleMapKey';
import imagePath from '../constants/imagePath';
import Loader from '../components/Loader';

const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * (Dimensions.get('window').width / Dimensions.get('window').height);

const ResourceRouteScreen = ({ route }) => {
    const { curLoc, destinationCords } = route.params;

    const mapRef = useRef();

    const [state, setState] = useState({
        isLoading: false,
        coordinate: new AnimatedRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        distance: 0,
        time: 0
    });

    const { isLoading, coordinate, distance, time } = state;

    useEffect(() => {
        mapRef.current.animateToRegion({
            ...curLoc,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    }, []);

    const fetchTime = (d, t) => {
        setState(prevState => ({
            ...prevState,
            distance: d,
            time: t
        }));
    };

    return (
        <View style={styles.container}>
            {distance !== 0 && time !== 0 && (
                <View style={styles.infoContainer}>
                    <Text>Time left: {time.toFixed(0)} min</Text>
                    <Text>Distance left: {distance.toFixed(0)} km</Text>
                </View>
            )}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        ...curLoc,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA
                    }}
                >
                    <Marker.Animated
                        coordinate={coordinate}
                    >
                        <Image
                            source={imagePath.icBike}
                            style={styles.markerImage}
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
                            onReady={result => {
                                fetchTime(result.distance, result.duration);
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        top: 50,
                                        right: 50,
                                        bottom: 50,
                                        left: 50
                                    }
                                });
                            }}
                        />
                    )}
                </MapView>
                <TouchableOpacity
                    style={styles.centerButton}
                    onPress={() => {
                        mapRef.current.animateToRegion({
                            ...curLoc,
                            latitudeDelta: LATITUDE_DELTA,
                            longitudeDelta: LONGITUDE_DELTA
                        });
                    }}
                >
                    <Image source={imagePath.greenIndicator} />
                </TouchableOpacity>
            </View>
            <Loader isLoading={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoContainer: {
        alignItems: 'center',
        marginVertical: 16
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerImage: {
        width: 40,
        height: 40,
    },
    centerButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
    },
});

export default ResourceRouteScreen;
