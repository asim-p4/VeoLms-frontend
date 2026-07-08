/**
 * @fileoverview Authentication Store
 * Manages user authentication state and session.
 * 
 * DESIGN DECISIONS:
 * - Access token is kept IN MEMORY ONLY (not persisted) for security.
 * - Refresh token is in HttpOnly cookie (handled by browser/axios).
 * - User object is persisted to localStorage for fast UI rendering on reload.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { api } from '../lib/axios';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (accessToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,
      
      login: (user, accessToken) => set({ user, accessToken, error: null }),
      
      logout: async () => {
        try {
          // Attempt server logout to clear refresh cookie and invalidate token
          await api.post('/auth/logout');
        } catch (error) {
          console.error("Logout failed", error);
        } finally {
          // Always clear local state
          set({ user: null, accessToken: null });
        }
      },
      
      setAccessToken: (accessToken) => set({ accessToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          // Step 1: Exchange the HttpOnly refresh token cookie for a new access token.
          // Uses raw axios to bypass the interceptor (which would loop if this 401s).
          const { data } = await api.post('/auth/refresh');
          const token = data.data.accessToken as string;
          
          // Step 2: Store the token in memory immediately.
          set({ accessToken: token });
          
          // Step 3: Fetch the user profile. Pass the token explicitly in the
          // header to avoid any timing issue with Zustand state propagation.
          const userRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: userRes.data.data.user, error: null });
        } catch {
          // Refresh failed — not logged in. Silently clear state.
          // Do NOT call logout() here: that would make an API call that also fails.
          set({ user: null, accessToken: null });
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'veolms-auth-storage',
      // Only persist the user object. Access token must be renewed on every refresh.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
