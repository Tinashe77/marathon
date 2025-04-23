// src/utils/axios.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://econet-marathon-api.onrender.com/api/v1';

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false  // Set this to false to resolve the CORS issue
});

// Add request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;