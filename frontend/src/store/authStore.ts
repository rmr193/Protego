import { create } from 'zustand';
import { authApi } from '../services/api';

export interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string;
  nid_number?: string;
  avatar_url?: string;
  role_id?: string;
  role?: {
    name: 'CITIZEN' | 'POLICE_OFFICER';
    description?: string;
  };
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (data: { full_name: string; email: string; phone: string; password: string; address?: string; nid_number?: string }) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: { full_name?: string; phone?: string; address?: string; nid_number?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: UserProfile, token: string) => void;
}

const getStoredAuth = (): { user: UserProfile | null; token: string | null } => {
  try {
    const token = localStorage.getItem('protego_token');
    const userStr = localStorage.getItem('protego_user');
    if (token && userStr) {
      return { token, user: JSON.parse(userStr) };
    }
  } catch (e) {
    console.error('Failed to parse stored auth:', e);
  }
  return { user: null, token: null };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialAuth.user,
  token: initialAuth.token,
  isAuthenticated: !!initialAuth.token,
  isLoading: false,
  error: null,

  login: async credentials => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      const { user, accessToken } = response.data;

      localStorage.setItem('protego_token', accessToken);
      localStorage.setItem('protego_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, role: user.role?.name || 'CITIZEN' };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  register: async data => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { user, accessToken } = response.data;

      localStorage.setItem('protego_token', accessToken);
      localStorage.setItem('protego_user', JSON.stringify(user));

      set({
        user,
        token: accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Registration failed.';
      set({ isLoading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.updateProfile(data);
      const updatedUser = response.data; // response.data is the user object
      
      const currentToken = get().token;
      if (currentToken) {
        localStorage.setItem('protego_user', JSON.stringify(updatedUser));
      }
      set({ user: updatedUser, isLoading: false });
      return { success: true };
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      set({ 
        isLoading: false, 
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('protego_token');
    localStorage.removeItem('protego_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  setUser: (user, token) => {
    localStorage.setItem('protego_token', token);
    localStorage.setItem('protego_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  }
}));
