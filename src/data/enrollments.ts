/**
 * @fileoverview Mock enrollments data.
 * Ties users to courses and tracks their overall progress.
 */
import { Enrollment } from '../types';

export const enrollments: Enrollment[] = [
  {
    id: 'enr-001',
    userId: 'student-001',
    courseId: 'react-masterclass',
    enrolledAt: '2024-06-16T08:00:00Z',
    progressPercentage: 45,
    lastAccessedLessonId: 'lesson-1-2'
  },
  {
    id: 'enr-002',
    userId: 'student-001',
    courseId: 'js-fundamentals',
    enrolledAt: '2024-06-15T11:00:00Z',
    progressPercentage: 100, // Completed course
  }
];
