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
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { api } from '../../lib/mockApi';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export function CourseManagementPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    api.getCourses().then(setCourses);
  }, []);

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      setCourses(courses.filter(c => c.id !== id));
      // In real app, trigger api.deleteCourse(id)
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
            {filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={course.thumbnail} alt="" className="h-10 w-16 object-cover rounded shadow-sm" />
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-500">{course.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="px-6 py-4 font-medium">₹{(course.price / 100).toLocaleString()}</td>
                <td className="px-6 py-4">{course.studentsCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/courses/${course.id}`} target="_blank" title="View Public Page"><Eye className="h-4 w-4 text-gray-500" /></a>
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit Course">
                    <Edit className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Delete Course" onClick={() => handleDelete(course.id)}>
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
