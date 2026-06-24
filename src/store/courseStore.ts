/**
 * @fileoverview Course State Store
 * Manages the state for the course catalog, including search, filtering, and sorting.
 * 
 * PERFORMANCE NOTE: Complex filtering is done component-side or API-side.
 * This store only holds the *criteria* to ensure URL sync and component decoupling.
 */
import { create } from 'zustand';
import { CourseCategory, CourseLevel } from '../types';

export type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc' | 'rating';

interface CourseFilterState {
  /** Global search query for courses */
  searchQuery: string;
  /** Selected categories to filter by (empty means all) */
  selectedCategories: CourseCategory[];
  /** Selected difficulty levels to filter by */
  selectedLevels: CourseLevel[];
  /** Current active sorting method */
  sortBy: SortOption;
  
  // Actions
  setSearchQuery: (query: string) => void;
  toggleCategory: (category: CourseCategory) => void;
  toggleLevel: (level: CourseLevel) => void;
  setSortBy: (sort: SortOption) => void;
  /** Reset all filters to default state */
  clearFilters: () => void;
}

export const useCourseStore = create<CourseFilterState>((set) => ({
  searchQuery: '',
  selectedCategories: [],
  selectedLevels: [],
  sortBy: 'popular',

  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleCategory: (category) => set((state) => ({
    selectedCategories: state.selectedCategories.includes(category)
      ? state.selectedCategories.filter(c => c !== category)
      : [...state.selectedCategories, category]
  })),
  
  toggleLevel: (level) => set((state) => ({
    selectedLevels: state.selectedLevels.includes(level)
      ? state.selectedLevels.filter(l => l !== level)
      : [...state.selectedLevels, level]
  })),
  
  setSortBy: (sort) => set({ sortBy: sort }),
  
  clearFilters: () => set({ 
    searchQuery: '', 
    selectedCategories: [], 
    selectedLevels: [],
    sortBy: 'popular'
  })
}));
