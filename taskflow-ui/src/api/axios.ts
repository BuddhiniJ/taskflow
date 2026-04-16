import axios from 'axios';

// Base URL of your .NET API
const api = axios.create({
  baseURL: 'https://localhost:7232/api', // check your actual port in launchSettings.json
});

// Interceptor — runs before every request
// Automatically attaches the JWT token to every request header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor — runs on every response error
// If any request gets a 401, clear storage and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;