/**
 * @fileoverview Mock API Layer
 * Simulates backend API calls with realistic delays and error handling.
 * 
 * DESIGN DECISION: Using a mock API layer instead of direct data imports
 * ensures an easy migration to a real backend later. All functions mirror real API
 * endpoints and return Promise-wrapped data with simulated network latency.
 * 
 * TODO: Replace each mock function with actual `fetch` or `axios` calls when the backend is ready.
 */
import { Course, User, Enrollment } from '../types';
import { courses } from '../data/courses';
import { mockUsers } from '../data/users';
import { enrollments } from '../data/enrollments';

/**
 * Simulates network delay to make the app feel realistic.
 * Random delay between 200-800ms to mimic real API latency.
 * @returns {Promise<void>} Resolves after the simulated delay.
 */
const simulateDelay = (): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));

/**
 * Simulates potential API errors (5% chance).
 * Used to test error handling and error boundaries in the UI.
 * @throws {Error} Randomly throws a network error.
 */
const simulateError = (): void => {
  if (Math.random() < 0.05) {
    throw new Error('Network error: Failed to fetch data');
  }
};

/**
 * API Client Simulation Object
 */
export const api = {
  /**
   * Fetches the complete catalog of published courses.
   * @returns {Promise<Course[]>} Array of available courses.
   * @example const allCourses = await api.getCourses();
   */
  getCourses: async (): Promise<Course[]> => {
    await simulateDelay();
    simulateError();
    return Object.values(courses).filter(course => course.isPublished);
  },

  /**
   * Fetches a specific course by its ID.
   * @param {string} id - The course ID.
   * @returns {Promise<Course>} The requested course.
   * @throws {Error} If the course is not found.
   */
  getCourseById: async (id: string): Promise<Course> => {
    await simulateDelay();
    simulateError();
    const course = courses[id];
    if (!course) throw new Error('Course not found');
    return course;
  },

  /**
   * Simulates a login request.
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<User>} The authenticated user object without password
   * @throws {Error} If credentials are invalid
   */
  login: async (email: string, password: string): Promise<User> => {
    await simulateDelay();
    const user = mockUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    // Omit password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  /**
   * Fetches enrollments for a specific user ID.
   * @param {string} userId - The user ID.
   * @returns {Promise<Enrollment[]>} Array of the user's enrollments.
   */
  getUserEnrollments: async (userId: string): Promise<Enrollment[]> => {
    await simulateDelay();
    return enrollments.filter(e => e.userId === userId);
  }
};
