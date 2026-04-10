import { create } from 'zustand';
import Cookies from 'js-cookie';
import { api } from '@/lib/api';

interface User { id: string; email: string; name: string; avatarUrl?: string | null; }

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  loadUser: async () => {
    try {
      const token = Cookies.get('accessToken');
      if (!token) { set({ isLoading: false }); return; }
      const { data } = await api.get('/auth/me');
      set({ user: data, isLoading: false });
    } catch {
      Cookies.remove('accessToken');
      set({ isLoading: false });
    }
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    Cookies.set('accessToken', data.accessToken, { expires: 1 });
    Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    set({ user: data.user });
  },
  signup: async (name, email, password) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    Cookies.set('accessToken', data.accessToken, { expires: 1 });
    Cookies.set('refreshToken', data.refreshToken, { expires: 30 });
    set({ user: data.user });
  },
  logout: async () => {
    try { await api.post('/auth/logout', { refreshToken: Cookies.get('refreshToken') }); } catch {}
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null });
  },
}));
