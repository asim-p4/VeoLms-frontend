/**
 * @fileoverview Mock user database.
 * Contains both admin and student accounts for testing the authentication flow.
 * 
 * TODO: Remove completely in production.
 */
import { UserRole } from '../types';

export const mockUsers = [
  {
    id: 'admin-001',
    name: 'Platform Admin',
    email: 'admin@veolms.com',
    password: 'Admin@123!',  // DEV ONLY - hashed in production
    role: UserRole.ADMIN,
    avatar: undefined,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'student-001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'Student@123',
    role: UserRole.STUDENT,
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    createdAt: '2024-06-15T10:30:00Z'
  },
  {
    id: 'student-002',
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'Student@123',
    role: UserRole.STUDENT,
    avatar: 'https://i.pravatar.cc/150?u=priya',
    createdAt: '2024-06-20T14:15:00Z'
  }
];
