/**
 * @fileoverview Core type definitions for the VeoLMS platform.
 * These interfaces represent the data models used throughout the application.
 * 
 * TODO: Align these interfaces exactly with the backend API schemas once available.
 */

/**
 * User role enum defining access levels in the system
 * ADMIN: Single platform administrator created via seed, not registration
 * STUDENT: Default role for self-registered users
 */
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

/**
 * Core User type representing both students and admin
 * Used throughout the application for auth and profile management
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Display name shown in UI */
  name: string;
  /** Email used for login - unique across all users */
  email: string;
  /** Determines access level and dashboard routing */
  role: UserRole;
  /** URL to avatar image */
  avatar?: string;
  /** ISO date string of account creation */
  createdAt: string;
}

/**
 * Represents course categories available on the platform
 */
export type CourseCategory = 
  | 'Frontend' 
  | 'Backend' 
  | 'DevOps' 
  | 'Data Science' 
  | 'Mobile' 
  | 'Design';

/**
 * Course difficulty levels
 */
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

/**
 * Instructor profile details associated with a course
 */
export interface Instructor {
  /** Instructor's full name */
  name: string;
  /** URL to instructor's profile picture */
  avatar: string;
  /** Short biography or tagline */
  bio: string;
  /** Total number of students taught across all courses */
  studentsCount: number;
  /** Number of courses authored */
  coursesCount: number;
}

/**
 * Course interface for the LMS platform
 * Contains all metadata and content structure for a course
 */
export interface Course {
  /** MongoDB identifier */
  _id?: string;
  /** Unique course identifier (UUID) */
  id: string;
  slug?: string;
  /** Course title displayed in cards and detail pages */
  title: string;
  /** Short description for course cards (max 150 chars) */
  description: string;
  /** Full description with markdown support for detail page */
  longDescription?: string;
  /** URL to course thumbnail image (16:9 ratio recommended) */
  thumbnail: string;
  /** YouTube or video trailer URL for preview */
  trailerUrl?: string;
  /** Regular price in INR (paise for precision) */
  price: number;
  /** Discounted price if on sale, undefined if no discount */
  discountPrice?: number;
  /** Instructor details */
  instructor: Instructor;
  /** Primary category for filtering and organization */
  category: CourseCategory;
  /** Difficulty level */
  level: CourseLevel;
  /** Total duration of all lessons in minutes */
  duration: number;
  totalDuration?: number;
  /** Number of enrolled students */
  studentsCount: number;
  /** Average rating out of 5 */
  rating: number;
  /** Total number of reviews */
  reviewsCount: number;
  /** Course content structure */
  sections: Section[];
  /** Searchable tags for discovery */
  tags: string[];
  /** ISO date of last content update */
  updatedAt: string;
  /** Whether course is published and visible */
  isPublished: boolean;
}

/**
 * Section within a course - groups related lessons
 * Acts as a chapter or module in the curriculum
 */
export interface Section {
  _id?: string;
  /** Unique section identifier */
  id: string;
  /** Section title (e.g., "Introduction to React") */
  title: string;
  /** Display order within course */
  order: number;
  /** Lessons contained in this section */
  lessons: Lesson[];
}

/**
 * Individual lesson within a course section
 * Represents a single video or content unit
 */
export interface Lesson {
  _id?: string;
  /** Unique lesson identifier */
  id: string;
  /** Lesson title shown in curriculum */
  title: string;
  /** Duration in minutes */
  duration: number;
  /** Video URL (YouTube or mock video) */
  videoUrl: string;
  /** Whether this lesson is available for preview without enrollment */
  isPreview: boolean;
  /** Display order within section */
  order: number;
  /** Lesson description for detail view */
  description?: string;
}

/**
 * Enrollment record linking a user to a course
 */
export interface Enrollment {
  /** Unique enrollment ID */
  id: string;
  /** User ID of the student */
  userId: string;
  /** Course ID enrolled in */
  courseId: string;
  /** Date of enrollment */
  enrolledAt: string;
  /** Overall completion percentage (0-100) */
  progressPercentage: number;
  /** ID of the last lesson accessed */
  lastAccessedLessonId?: string;
}

/**
 * Progress record tracking completion of individual lessons
 */
export interface LessonProgress {
  /** Unique progress ID */
  id: string;
  /** Associated enrollment ID */
  enrollmentId: string;
  /** Associated lesson ID */
  lessonId: string;
  /** Whether the lesson is marked complete */
  isCompleted: boolean;
  /** ISO date when marked complete */
  completedAt?: string;
}
