import { apiClient } from '@/shared/api/apiClient';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  // Login with email and password
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', input);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  // Register a new account
  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', input);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  // Logout (clear token)
  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    // Optionally notify server
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      // Ignore logout errors
    }
  },

  // Update user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', data);
  },

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
};
