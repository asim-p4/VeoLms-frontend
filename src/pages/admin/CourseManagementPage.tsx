/**
 * @fileoverview Course Management Table
 * Allows admins to view, edit, and delete courses.
 * 
 * FEATURES:
 * - Search by title
 * - Pagination (Mocked)
 * - Delete confirmation modal integration (Mocked)
 */
import * as React from 'react';
import { Plus, Search, Edit, Trash2, Eye, Globe, Lock } from 'lucide-react';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { resolveMediaUrl } from '../../utils/media';
import { Badge } from '../../components/ui/Badge';

export function CourseManagementPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [search, setSearch] = React.useState('');
  const [togglingCourseId, setTogglingCourseId] = React.useState<string | null>(null);

  React.useEffect(() => {
    api.get('/admin/courses').then(res => setCourses(res.data.data.courses)).catch(console.error);
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleTogglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      setTogglingCourseId(courseId);
      await api.patch(`/admin/courses/${courseId}`, { isPublished: !currentStatus });
      setCourses(prev =>
        prev.map(c =>
          ((c._id || c.id) === courseId ? { ...c, isPublished: !currentStatus } : c)
        )
      );
    } catch (err) {
      console.error('Failed to toggle publish status', err);
      alert('Failed to update course publish status. Please try again.');
    } finally {
      setTogglingCourseId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/courses/${id}`);
        setCourses(courses.filter(c => (c._id || c.id) !== id));
      } catch (err) {
        console.error('Failed to delete course', err);
        alert('Failed to delete course');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Course Management</h1>
          <p className="text-sm text-gray-500">Manage your course catalog, pricing, and visibility.</p>
        </div>
        <Button asChild>
          <a href="/admin/courses/new"><Plus className="h-4 w-4 mr-2" /> Create Course</a>
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by course title..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Enrolled</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCourses.map((course, idx) => (
              <tr key={course._id ?? course.id ?? idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {course.thumbnail && (
                      <img src={resolveMediaUrl(course.thumbnail)} alt="" className="h-10 w-16 object-cover rounded shadow-sm" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>

                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTogglePublish(course._id ?? course.id, !!course.isPublished)}
                    disabled={togglingCourseId === (course._id ?? course.id)}
                    className="inline-flex items-center group focus:outline-none"
                    title={`Click to ${course.isPublished ? 'unpublish' : 'publish'}`}
                  >
                    <Badge variant={course.isPublished ? 'default' : 'secondary'} className="cursor-pointer hover:opacity-80 transition-opacity">
                      {togglingCourseId === (course._id ?? course.id) ? (
                        'Updating...'
                      ) : course.isPublished ? (
                        <span className="inline-flex items-center"><Globe className="h-3 w-3 mr-1 text-primary-600" /> Published</span>
                      ) : (
                        <span className="inline-flex items-center"><Lock className="h-3 w-3 mr-1 text-gray-500" /> Draft</span>
                      )}
                    </Badge>
                  </button>
                </td>
                <td className="px-6 py-4 font-medium">${((course.price ?? 0) / 100).toLocaleString()}</td>
                <td className="px-6 py-4">{(course.studentsCount ?? 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTogglePublish(course._id ?? course.id, !!course.isPublished)}
                    disabled={togglingCourseId === (course._id ?? course.id)}
                    className={course.isPublished ? 'text-amber-600 border-amber-300 hover:bg-amber-50 h-8 text-xs' : 'text-green-600 border-green-300 hover:bg-green-50 h-8 text-xs'}
                  >
                    {togglingCourseId === (course._id ?? course.id) ? '...' : course.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/courses/${course.slug ?? course.id}`} target="_blank" title="View Public Page"><Eye className="h-4 w-4 text-gray-500" /></a>
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit Course" asChild>
                    <a href={`/admin/courses/${course._id ?? course.id}/edit`}><Edit className="h-4 w-4 text-blue-500" /></a>
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete Course" onClick={() => handleDelete(course._id ?? course.id)}>
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredCourses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No courses found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
