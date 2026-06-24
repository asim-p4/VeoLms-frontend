/**
 * @fileoverview UI State Store
 * Manages global UI state: theme, sidebar visibility, modals.
 * 
 * PERSISTENCE: Theme preference saved to localStorage.
 * ANIMATIONS: Components subscribing to these states should use smooth transitions.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UiState {
  /** Current UI theme preference */
  theme: Theme;
  /** Whether the mobile/tablet sidebar is open */
  isSidebarOpen: boolean;
  /** Whether the course lesson sidebar is open (Watch Lesson view) */
  isLessonSidebarOpen: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleLessonSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'system',
      isSidebarOpen: false,
      isLessonSidebarOpen: true, // Default to open on desktop
      
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleLessonSidebar: () => set((state) => ({ isLessonSidebarOpen: !state.isLessonSidebarOpen })),
    }),
    {
      name: 'veolms-ui-storage',
      // Only persist theme
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
