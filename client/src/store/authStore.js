import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (data) => {
    const res = await authAPI.login(data);
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
    return res.data;
  },

  register: async (data) => {
    const res = await authAPI.register(data);
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token, isAuthenticated: true });
    return res.data;
  },

  fetchUser: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

export default useAuthStore;
