/**
 * @fileoverview Course Detail Page
 * Detailed view of a single course. Designed to act as a sales/landing page for that specific course.
 * 
 * TODO: Integrate a real markdown parser for `longDescription`.
 * TODO: Handle `enroll` action bridging to the checkout/enrollment mock flow.
 */
import * as React from 'react';
import { PlayCircle, Clock, Users, Star, Check } from 'lucide-react';
import { api } from '../../lib/mockApi';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useParams } from 'react-router-dom';

export function CourseDetailPage() {
  const params = useParams();
  // In a real app, this would use useParams() from react-router
  const courseId = params.id || 'react-masterclass'; 
  const [course, setCourse] = React.useState<Course | null>(null);

  React.useEffect(() => {
    api.getCourseById(courseId).then(setCourse).catch(console.error);
  }, [courseId]);

  if (!course) {
    return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top Banner - Dark Mode aesthetic */}
      <div className="bg-gray-900 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex gap-2 text-sm font-medium text-primary-300">
              <span>{course.category}</span>
              <span>•</span>
              <span>{course.level}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{course.title}</h1>
            <p className="text-lg text-gray-300">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold text-white">{course.rating}</span>
                <span className="text-gray-400">({course.reviewsCount} ratings)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Users className="h-5 w-5" /> {course.studentsCount.toLocaleString()} students
              </div>
            </div>
            
            <p className="text-sm text-gray-400">Created by <span className="underline">{course.instructor.name}</span></p>
          </div>

          {/* Floating Course Sales Card */}
          <div className="md:col-span-1">
            <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 md:absolute top-24 right-[10%] w-full md:w-80 z-10">
              <div className="relative aspect-video group cursor-pointer">
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold">₹{(course.discountPrice || course.price) / 100}</span>
                  {course.discountPrice && (
                    <span className="text-lg text-gray-500 line-through mb-1">₹{course.price / 100}</span>
                  )}
                </div>
                
                <Button size="lg" className="w-full text-lg h-12">Enroll Now</Button>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3"><Clock className="h-4 w-4" /> {course.duration / 60} hours on-demand video</div>
                  <div className="flex items-center gap-3"><Check className="h-4 w-4" /> Full lifetime access</div>
                  <div className="flex items-center gap-3"><Check className="h-4 w-4" /> Certificate of completion</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Detail */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:max-w-4xl md:mx-0">
        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        
        {/* Accordion-style Curriculum Mock */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-12">
          {course.sections.map((section, idx) => (
            <div key={section.id} className={`border-b border-gray-200 last:border-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="p-4 flex justify-between items-center font-medium">
                <span>{section.title}</span>
                <span className="text-sm text-gray-500">{section.lessons.length} lectures</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start p-6 border border-gray-200 rounded-xl bg-white">
          <img src={course.instructor.avatar} alt={course.instructor.name} className="w-24 h-24 rounded-full object-cover" />
          <div>
            <h3 className="text-xl font-bold">{course.instructor.name}</h3>
            <p className="text-gray-500 mb-4">{course.instructor.bio}</p>
            <div className="flex gap-4 text-sm font-medium text-gray-700">
              <span>{course.instructor.studentsCount.toLocaleString()} Students</span>
              <span>{course.instructor.coursesCount} Courses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
