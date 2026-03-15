import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Handle other errors
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export client
export default apiClient;

// Utility function for API calls
export async function apiCall<T = any>(
  method: 'get' | 'post' | 'patch' | 'delete' | 'put',
  url: string,
  data?: any
): Promise<T> {
  const response = await apiClient[method]<ApiResponse<T>>(url, data);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.message || 'Unknown error');
}
