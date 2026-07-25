/**
 * @fileoverview Course State Store
 * Manages the state for the course catalog, including search, filtering, and sorting.
 * 
 * PERFORMANCE NOTE: Complex filtering is done component-side or API-side.
 * This store only holds the *criteria* to ensure URL sync and component decoupling.
 */
import { create } from 'zustand';

export type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating';

interface CourseFilterState {
  /** Global search query for courses */
  searchQuery: string;
  /** Current active sorting method */
  sortBy: SortOption;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  /** Reset all filters to default state */
  clearFilters: () => void;
}

export const useCourseStore = create<CourseFilterState>((set) => ({
  searchQuery: '',
  sortBy: 'popular',

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSortBy: (sort) => set({ sortBy: sort }),
  
  clearFilters: () => set({ 
    searchQuery: '', 
    sortBy: 'popular'
  })
}));
