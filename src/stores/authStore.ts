import { create } from 'zustand';
import { authService } from '../services/authClient';
import { AuthError } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // until initialize() restores any saved session

  // Restore a persisted session from the secure store on app start.
  initialize: async () => {
    try {
      const session = await authService.restoreSession();
      if (session) {
        set({ user: session.user, token: session.token, isAuthenticated: true });
      }
    } catch {
      // Corrupt/absent session — treat as signed out.
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const session = await authService.login(email, password);
      set({ user: session.user, token: session.token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error instanceof AuthError ? error : new Error('Unable to sign in');
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const session = await authService.register(name, email, password);
      set({ user: session.user, token: session.token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error instanceof AuthError ? error : new Error('Unable to create account');
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
