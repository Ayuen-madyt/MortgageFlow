import axios from 'axios';

// Create a base Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8800/api',
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    }`,
  },
});

// Function to modify the headers with a new token
const setAuthorizationToken = (token: string | null) => {
  axiosInstance.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : null;
};

export { axiosInstance, setAuthorizationToken };
