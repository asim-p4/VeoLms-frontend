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
import { CourseCard } from '../../components/lms/CourseCard';

export function CoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Connect to Zustand store
  const { 
    searchQuery, setSearchQuery, 
    sortBy, setSortBy 
  } = useCourseStore();

  React.useEffect(() => {
    setIsLoading(true);
    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (sortBy) params.append('sort', sortBy);
    
    api.get(`/courses?${params.toString()}`)
      .then(res => {
        setCourses(res.data.data.courses);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [searchQuery, sortBy]);

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 flex flex-col gap-8">
      
      {/* Main Content Area */}
      <div className="flex-1">
        
        {/* Search Bar & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search courses or instructors..." 
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
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
