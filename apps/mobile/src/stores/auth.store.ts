import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  loadFromStorage: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync('accessToken');
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  signup: async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },
}));
