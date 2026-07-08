/**
 * @fileoverview Admin Dashboard Overview
 * Provides platform administrators with key metrics and recent activities.
 * 
 * FEATURES:
 * - Statistical KPI cards
 * - Recent enrollments table (mock data)
 */
import * as React from 'react';
import { Users, BookOpen, CreditCard, Activity } from 'lucide-react';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

export function AdminDashboardPage() {
  const [stats, setStats] = React.useState({ courses: 0, revenue: 0, students: 0 });
  const [recentCourses, setRecentCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/admin/stats').then(res => {
      const data = res.data.data;
      setStats({
        courses: data.stats.totalCourses,
        revenue: data.stats.totalRevenue,
        students: data.stats.totalStudents,
      });
      // Mock recent courses via enrollments for now if recentCourses isn't provided directly, 
      // or we can just fetch /admin/courses
      api.get('/admin/courses?limit=5').then(cRes => {
        setRecentCourses(cRes.data.data.courses);
        setIsLoading(false);
      });
    }).catch(console.error);
  }, []);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome to the VeoLMS administration panel.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Revenue', value: `₹${(stats.revenue / 100).toLocaleString()}`, icon: CreditCard, subtitle: '+20.1% from last month' },
          { title: 'Total Students', value: stats.students.toLocaleString(), icon: Users, subtitle: '+180 new students' },
          { title: 'Active Courses', value: stats.courses.toString(), icon: BookOpen, subtitle: '2 pending review' },
          { title: 'Active Sessions', value: '543', icon: Activity, subtitle: 'Currently online' },
        ].map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Courses Table Mock */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Course Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Students</th>
                  <th className="px-4 py-3 text-right">Rating</th>
                </tr>
              </thead>
              <tbody>
                {recentCourses.map((course) => (
                  <tr key={course._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-xs">{course.title}</td>
                    <td className="px-4 py-3">{course.category}</td>
                    <td className="px-4 py-3 text-right">₹{(course.discountPrice || course.price) / 100}</td>
                    <td className="px-4 py-3 text-right">{course.studentsCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-yellow-600">{course.rating} ★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
