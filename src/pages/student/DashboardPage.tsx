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
import { Course, Enrollment } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
// Assuming a Radix-based Progress primitive exists
import * as Progress from '@radix-ui/react-progress';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = React.useState<(Enrollment & { course: Course })[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    
    api.get('/enrollments/me').then(res => {
      setEnrollments(res.data.data.enrollments);
      setIsLoading(false);
    }).catch(console.error);
  }, [user]);

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-64 w-full rounded-xl" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-2">Pick up right where you left off.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Enrolled Courses', value: enrollments.length, icon: BookOpen, color: 'text-blue-500 bg-blue-50' },
          { label: 'Completed Lessons', value: '12', icon: Award, color: 'text-success bg-green-50' },
          { label: 'Hours Learned', value: '4.5', icon: Clock, color: 'text-warning bg-yellow-50' },
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
          {enrollments.map(({ course, progressPercentage }) => (
            <div key={course._id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="default" className="rounded-full shadow-lg gap-2" asChild>
                    <a href={`/learn/${course.slug}`}>
                      <Play className="h-4 w-4" /> Continue
                    </a>
                  </Button>
                </div>
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
    </div>
  );
}
