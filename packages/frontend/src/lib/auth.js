import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from './api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      isAuthenticated: () => !!get().token,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { accessToken, user } = data.data;
          set({ user, token: accessToken, isLoading: false });
          return true;
        } catch (err) {
          const message =
            err.response?.data?.message || 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', {
            email,
            password,
            fullName,
          });
          const user = data.data;
          set({ user, isLoading: false });
          return user;
        } catch (err) {
          const message =
            err.response?.data?.message || 'Registration failed. Please try again.';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // ignore
        }
        set({ user: null, token: null, error: null });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return null;
        try {
          const { data } = await api.get('/users/me');
          set({ user: data.data });
          return data.data;
        } catch {
          set({ user: null, token: null });
          return null;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
