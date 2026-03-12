import apiClient, { type ApiResponse } from '@/shared/api/apiClient';

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// ─── Mock users store (persisted to localStorage) ──────────────────────────
const MOCK_USERS_KEY = 'mock_users_db';

function getMockUsers(): Array<User & { password: string }> {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMockUsers(users: Array<User & { password: string }>) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function makeMockToken(user: User): string {
  return btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 7 * 86400000 }));
}

// ─────────────────────────────────────────────────────────────────────────────

export const authService = {
  // Register
  async register(input: RegisterInput): Promise<AuthResponse> {
    // Try real backend first
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        input
      );
      if (response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (err: any) {
      // If network error — fall back to mock
      if (!err.response) {
        const users = getMockUsers();
        if (users.find(u => u.email === input.email)) {
          throw new Error('User with this email already exists');
        }
        const user: User = {
          id: `user_${Date.now()}`,
          email: input.email,
          name: input.name,
          avatar: null,
          createdAt: new Date().toISOString(),
        };
        saveMockUsers([...users, { ...user, password: input.password }]);
        const token = makeMockToken(user);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { token, user };
      }
      throw err;
    }
  },

  // Login
  async login(input: LoginInput): Promise<AuthResponse> {
    // Try real backend first
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        input
      );
      if (response.data.data) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }
      throw new Error(response.data.message || 'Login failed');
    } catch (err: any) {
      // If network error — fall back to mock
      if (!err.response) {
        const users = getMockUsers();
        const found = users.find(u => u.email === input.email && u.password === input.password);
        if (!found) {
          // Also check our seeded demo user
          if (input.email === 'demo@example.com' && input.password === 'demo123') {
            const demoUser: User = {
              id: 'demo_user',
              email: 'demo@example.com',
              name: 'Demo User',
              avatar: null,
              createdAt: new Date().toISOString(),
            };
            const token = makeMockToken(demoUser);
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(demoUser));
            return { token, user: demoUser };
          }
          throw new Error('Invalid email or password');
        }
        const { password: _, ...user } = found;
        const token = makeMockToken(user);
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        return { token, user };
      }
      throw err;
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      if (response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error('Failed to fetch user');
    } catch (err: any) {
      if (!err.response) {
        const stored = this.getStoredUser();
        if (stored) return stored as User;
        throw new Error('Not authenticated');
      }
      throw err;
    }
  },

  // Update profile
  async updateProfile(data: { name?: string; avatar?: string }): Promise<User> {
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/auth/me', data);
      if (response.data.data) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
      throw new Error('Failed to update profile');
    } catch (err: any) {
      if (!err.response) {
        const user = this.getStoredUser();
        if (!user) throw new Error('Not authenticated');
        const updated = { ...user, ...data };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated as User;
      }
      throw err;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
};
