/**
 * @fileoverview Global utility functions used across the application.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Safely merges Tailwind classes, resolving conflicts.
 * Essential for UI components that accept custom class names alongside default variants.
 * 
 * @param {ClassValue[]} inputs - Array of class names, objects, or conditional classes
 * @returns {string} Merged and conflict-resolved tailwind class string
 * 
 * @example
 * cn('px-2 py-1 bg-red-500', className, { 'bg-blue-500': isBlue })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
