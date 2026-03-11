import axios from 'axios';
import type { User } from '@/shared/types';

const API_URL = 'http://localhost:3001/api';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name?: string): Promise<{ user: User; token: string }> => {
    const response = await axios.post(`${API_URL}/auth/register`, { email, password, name });
    return response.data;
  },
  
  me: async (token: string): Promise<{ user: User }> => {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
