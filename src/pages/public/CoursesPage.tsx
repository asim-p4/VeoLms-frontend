/**
 * @fileoverview Course Catalog Page
 * Displays the grid of available courses with complex filtering and sorting logic.
 * 
 * RESPONSIVE:
 * - Desktop: Sidebar filters to the left of the grid.
 * - Mobile: Filters become a bottom-sheet modal.
 * 
 * STATE MANAGEMENT:
 * - Uses `courseStore` for persistent filter selections.
 */
import * as React from 'react';
import { Filter, Search } from 'lucide-react';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { useCourseStore } from '../../store/courseStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

export function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Connect to Zustand store
  const { searchQuery, setSearchQuery, selectedCategories, toggleCategory, sortBy, setSortBy } = useCourseStore();

  React.useEffect(() => {
    setIsLoading(true);
    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategories.length > 0) params.append('category', selectedCategories.join(',')); // API might handle multiple if we update it, or just first one
    if (sortBy) params.append('sort', sortBy);
    
    api.get(`/courses?${params.toString()}`)
      .then(res => {
        setCourses(res.data.data.courses);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCategories, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
        <div>
          <h3 className="font-semibold text-lg mb-4">Categories</h3>
          <div className="space-y-3">
            {['Frontend', 'Backend', 'DevOps', 'Data Science'].map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat as any)}
                  onChange={() => toggleCategory(cat as any)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        
        {/* Mobile Filter Toggle & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button variant="outline" className="md:hidden flex w-full sm:w-auto items-center justify-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-200 rounded-xl bg-white">
            <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No courses found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search term.</p>
            <Button variant="outline" onClick={() => useCourseStore.getState().clearFilters()}>Clear all filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Same Course Card markup from HomePage could be abstracted to a <CourseCard> component */}
            {courses.map(course => (
              <a key={course._id} href={`/courses/${course.slug}`} className="group block rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                <div className="aspect-video w-full overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg line-clamp-2 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{course.instructor.name}</p>
                  <div className="text-lg font-bold text-gray-900">₹{(course.discountPrice || course.price) / 100}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
