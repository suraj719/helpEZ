import axios from 'axios';

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const API_KEY = 'AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc'; // Replace with your API key

export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await axios.get(GEOCODING_API_URL, {
      params: {
        latlng: `${latitude},${longitude}`,
        key: API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      return response.data.results[0]?.formatted_address || 'Unknown location';
    } else {
      return 'Error fetching location';
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    return 'Error fetching location';
  }
};
