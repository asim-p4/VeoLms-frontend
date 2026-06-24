/**
 * @fileoverview Authentication Store
 * Manages user authentication state and session.
 * 
 * DESIGN DECISIONS:
 * - Only ONE admin account exists, created via seed, not registration.
 * - Single login endpoint for all users (role-based redirect handled at router level).
 * - Zustand persist middleware used to keep user logged in across page reloads.
 * 
 * SECURITY NOTES:
 * - In production: Token validation MUST happen server-side.
 * - In production: Passwords are NEVER stored in state (omitted in mockApi).
 * - Current mock: For demonstration purposes only.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  /** The currently authenticated user, null if logged out */
  user: User | null;
  /** Global authentication loading state */
  isLoading: boolean;
  /** Global authentication error message */
  error: string | null;
  
  // Actions
  /** Action to set the authenticated user upon successful login */
  login: (user: User) => void;
  /** Action to clear the session */
  logout: () => void;
  /** Set loading state during auth operations */
  setLoading: (isLoading: boolean) => void;
  /** Set error messages for login failures */
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: (user) => set({ user, error: null }),
      logout: () => set({ user: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error })
    }),
    {
      name: 'veolms-auth-storage', // Key in localStorage
      // We only want to persist the user object, not loading/error states
      partialize: (state) => ({ user: state.user }),
    }
  )
);
