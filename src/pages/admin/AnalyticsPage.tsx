/**
 * @fileoverview Admin Analytics Page
 * Visual platform analytics built with real data from:
 *   GET /api/admin/stats     → totals, revenue
 *   GET /api/admin/enrollments → recent enrollment records
 *
 * No external charting library needed — CSS-based bar chart for simplicity
 * and to avoid adding dependencies. Upgrade to Recharts later if needed.
 */
import * as React from 'react';
import { TrendingUp, Users, BookOpen, DollarSign, Award } from 'lucide-react';
import { api } from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';

interface StatsData {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
}

interface EnrollmentRecord {
  _id: string;
  user?: { name: string; email: string };
  course?: { title: string; thumbnail: string };
  enrolledAt: string;
  status: string;
}

// Simple CSS bar chart — each bar is a div with a percentage height
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-48 px-2">
      {data.map((bar) => (
        <div key={bar.label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-semibold text-gray-700">{bar.value}</span>
          <div className="w-full rounded-t-md transition-all duration-500" style={{
            height: `${Math.max((bar.value / max) * 160, 4)}px`,
            backgroundColor: bar.color,
          }} />
          <span className="text-xs text-gray-500 text-center leading-tight">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [recentEnrollments, setRecentEnrollments] = React.useState<EnrollmentRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [statsRes, enrollRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/enrollments?page=1&limit=10'),
        ]);
        setStats(statsRes.data.data.stats);
        setRecentEnrollments(enrollRes.data.data.enrollments ?? []);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const kpiCards = stats
    ? [
        {
          label: 'Total Revenue',
          value: `$${(stats.totalRevenue / 100).toLocaleString('en-US')}`,
          icon: DollarSign,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
        {
          label: 'Total Students',
          value: stats.totalStudents.toLocaleString(),
          icon: Users,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          label: 'Total Courses',
          value: stats.totalCourses.toLocaleString(),
          icon: BookOpen,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
        },
        {
          label: 'Total Enrollments',
          value: stats.totalEnrollments.toLocaleString(),
          icon: Award,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
      ]
    : [];

  // Build a simple breakdown chart: students / courses / enrollments
  const barData = stats
    ? [
        { label: 'Students',    value: stats.totalStudents,    color: '#3b82f6' },
        { label: 'Courses',     value: stats.totalCourses,     color: '#8b5cf6' },
        { label: 'Enrollments', value: stats.totalEnrollments, color: '#f59e0b' },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary-600" />
          Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide performance metrics.</p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-500">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Overview Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <BarChart data={barData} />
            )}
          </CardContent>
        </Card>

        {/* Avg. Enrollments per Course */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : stats ? (
              <>
                <div className="text-center py-6">
                  <p className="text-5xl font-bold text-primary-600">
                    {stats.totalCourses > 0
                      ? (stats.totalEnrollments / stats.totalCourses).toFixed(1)
                      : '0'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Avg. enrollments per course</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Students per Course', value: stats.totalCourses > 0 ? (stats.totalStudents / stats.totalCourses).toFixed(1) : '—' },
                    { label: 'Avg. Revenue per Enrollment', value: stats.totalEnrollments > 0 ? `$${((stats.totalRevenue / 100) / stats.totalEnrollments).toFixed(0)}` : '—' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Recent Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Enrolled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-gray-400">
                        No enrollments yet.
                      </td>
                    </tr>
                  ) : (
                    recentEnrollments.map((e) => (
                      <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xs flex-shrink-0">
                              {(e.user?.name ?? '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{e.user?.name ?? 'Unknown'}</p>
                              <p className="text-xs text-gray-400">{e.user?.email ?? ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700 truncate max-w-[200px]">
                          {e.course?.title ?? 'Unknown course'}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(e.enrolledAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
