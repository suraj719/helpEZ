import axios from 'axios';

// Create an instance of axios with custom configuration
const instance = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your API base URL
  timeout: 5000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
    // Add other default headers as needed
  }
});

// Optional: Add interceptors for request and response handling
instance.interceptors.request.use(
  config => {
    // Add any custom logic before sending requests
    return config;
  },
  error => {
    // Handle request errors
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => {
    // Handle successful responses
    return response.data;
  },
  error => {
    // Handle response errors
    return Promise.reject(error);
  }
);

export default instance;
