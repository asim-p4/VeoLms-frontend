/**
 * @fileoverview Landing Page
 * Public facing home page designed to showcase the platform and drive signups.
 * 
 * STRUCTURE:
 * 1. Hero Section (Search & CTA)
 * 2. Featured Courses (Horizontal scroll)
 * 3. Categories Grid
 * 4. Value Proposition
 * 
 * TODO: Replace static images with optimized responsive `<picture>` tags or Next/Image equivalent if porting to Next.js.
 */
import * as React from 'react';
import { Layout, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { CourseCard } from '../../components/lms/CourseCard';

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = React.useState<Course[]>([]);
  
  React.useEffect(() => {
    // Fetch mock data on mount
    api.get('/courses/featured').then(res => setFeaturedCourses(res.data.data.courses.slice(0, 4)));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gray-900 text-white overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        
        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Learn without limits
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Build skills with courses, certificates, and degrees online from world-class instructors.
          </p>
          
          <div className="max-w-2xl mx-auto flex items-center bg-transparent p-2 mb-8" />
          
          <div className="flex justify-center gap-8 text-sm font-medium text-gray-300">
            <div className="flex items-center gap-2"><Layout className="h-5 w-5 text-primary-400"/> 1000+ Courses</div>
            <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary-400"/> Expert Led</div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED COURSES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-500">Hand-picked selection of our top-rated content</p>
            </div>
            <Button variant="ghost" asChild className="hidden sm:flex">
              <a href="/courses">View All <ArrowRight className="ml-2 h-4 w-4"/></a>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map(course => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>
        </div>
      </section>



      {/* 4. CTA */}
      <section className="py-24 bg-primary-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to start learning?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">Join over 50,000 students learning from the best instructors in the industry.</p>
          <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100" asChild>
            <a href="/signup">Sign up for free</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
