import axios, { type AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Clear auth and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        throw error.response?.data ?? error;
      }
    );
  }

  get<T>(url: string): Promise<T> {
    return this.client.get<T, T>(url);
  }

  post<T>(url: string, data?: unknown): Promise<T> {
    return this.client.post<T, T>(url, data);
  }

  put<T>(url: string, data?: unknown): Promise<T> {
    return this.client.put<T, T>(url, data);
  }

  delete<T>(url: string): Promise<T> {
    return this.client.delete<T, T>(url);
  }

  patch<T>(url: string, data?: unknown): Promise<T> {
    return this.client.patch<T, T>(url, data);
  }
}

export const apiClient = new ApiClient();
