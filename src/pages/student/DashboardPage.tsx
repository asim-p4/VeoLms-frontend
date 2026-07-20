/**
 * @fileoverview Student Dashboard
 * Central hub for enrolled students to continue learning.
 * 
 * LAYOUT STRUCTURE:
 * 1. Header: "Welcome back, [Name]!"
 * 2. Continue Learning: Quick access to the last watched course
 * 3. My Courses: Grid of enrolled courses with progress bars
 * 
 * STATES TO HANDLE:
 * - New user (no enrollments): Show "Browse Courses" CTA
 * - Loading: Skeleton cards
 */
import * as React from 'react';
import { Play, BookOpen, Clock, Award } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/axios';
import { Course } from '../../types';

export interface Enrollment {
  _id: string;
  course: Course;
  progressPercentage: number;
  isActive: boolean;
}
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
// Assuming a Radix-based Progress primitive exists
import * as Progress from '@radix-ui/react-progress';
import { CourseCard } from '../../components/lms/CourseCard';

import { useSearchParams } from 'react-router-dom';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
  const [stats, setStats] = React.useState({ completedLessons: 0, hoursLearned: 0 });
  const [discoverCourses, setDiscoverCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
          // Synchronously verify payment to ensure instant enrollment even if webhook is delayed/failed
          await api.get(`/payments/verify-session?session_id=${sessionId}`);
          // Remove session_id from URL so it doesn't verify again on refresh
          searchParams.delete('session_id');
          setSearchParams(searchParams, { replace: true });
        }

        const [enrollmentsRes, statsRes, coursesRes] = await Promise.all([
          api.get('/enrollments/me'),
          api.get('/progress/stats'),
          api.get('/courses?limit=3')
        ]);
        
        setEnrollments(enrollmentsRes.data.data.enrollments);
        setStats(statsRes.data.data.stats);
        setDiscoverCourses(coursesRes.data.data.courses || coursesRes.data.data.result || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user, searchParams, setSearchParams]);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Removed Welcome Header as per request */}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-blue-500 bg-blue-50' },
          { label: 'Completed Lessons', value: stats.completedLessons, icon: Award, color: 'text-success bg-green-50' },
          { label: 'Hours Learned', value: stats.hoursLearned, icon: Clock, color: 'text-warning bg-yellow-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 flex items-center gap-4">
            <div className={`p-4 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses Grid */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Learning</h2>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">You haven't enrolled in any courses yet</h3>
          <p className="text-gray-500 mb-6">Discover thousands of courses from top instructors.</p>
          <Button asChild><a href="/courses">Browse Courses</a></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map(({ course, progressPercentage, isActive }) => (
            <div key={course._id} className={`group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow ${!isActive ? 'opacity-75 grayscale' : ''}`}>
              <div className="aspect-video relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                {!isActive && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                    LOCKED
                  </div>
                )}
                {isActive && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="default" className="rounded-full shadow-lg gap-2" asChild>
                      <a href={`/learn/${course.slug}`}>
                        <Play className="h-4 w-4" /> Continue
                      </a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-4">
                <h3 className="font-semibold line-clamp-2">{course.title}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>{progressPercentage}% Complete</span>
                  </div>
                  {/* Radix Progress implementation */}
                  <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-2">
                    <Progress.Indicator 
                      className="bg-primary-600 w-full h-full transition-transform duration-500 ease-in-out" 
                      style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
                    />
                  </Progress.Root>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Discover More Courses */}
      {discoverCourses.length > 0 && (
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Discover Courses</h2>
            <Button variant="outline" asChild>
              <a href="/courses">Browse All Courses</a>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discoverCourses.map(course => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
