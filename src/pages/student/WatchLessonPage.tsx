/**
 * @fileoverview Learning Interface (Watch Lesson)
 * Implements a distraction-free layout with a collapsible sidebar and the main video area.
 * 
 * RESPONSIVENESS:
 * - Sidebar is hidden on mobile by default and toggled via overlay.
 * - Video area takes precedence.
 * 
 * STATE:
 * - Depends on `uiStore` for `isLessonSidebarOpen`
 */
import * as React from 'react';
import { Menu, X, CheckCircle2, Circle, ChevronLeft } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';
import { api } from '../../lib/mockApi';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { VideoPlayer } from '../../components/lms/VideoPlayer';
import { useParams } from 'react-router-dom';

export function WatchLessonPage() {
  const { isLessonSidebarOpen, toggleLessonSidebar } = useUiStore();
  const [course, setCourse] = React.useState<Course | null>(null);
  const params = useParams();
  
  // Mock current lesson tracking
  const [activeLessonId, setActiveLessonId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // In real app, IDs come from URL params
    const courseId = params.id || 'react-masterclass';
    api.getCourseById(courseId).then(c => {
      setCourse(c);
      if (c.sections[0]?.lessons[0]) {
        setActiveLessonId(c.sections[0].lessons[0].id);
      }
    });
  }, [params.id]);

  if (!course) return <div className="h-screen w-full flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      
      {/* Compact Navbar for Learning Mode */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-900 text-white shrink-0">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors" title="Back to Dashboard">
            <ChevronLeft className="h-5 w-5" />
          </a>
          <h1 className="font-semibold text-sm truncate max-w-md">{course.title}</h1>
        </div>
        
        {/* Toggle Sidebar Button */}
        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-800" onClick={toggleLessonSidebar}>
          {isLessonSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* MAIN CONTENT AREA (Video Player + Description) */}
        <main className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
          {/* Placeholder for VideoPlayer (Phase 10) */}
          <VideoPlayer />
          
          {/* Lesson Info */}
          <div className="p-8 max-w-4xl">
            <h2 className="text-2xl font-bold mb-4">Introduction to React</h2>
            <div className="prose prose-gray max-w-none">
              <p>In this lesson, we will cover the foundational concepts of React, why it exists, and how it revolutionizes frontend development.</p>
              {/* Actual content would be fetched and rendered via markdown here */}
            </div>
          </div>
        </main>

        {/* CURRICULUM SIDEBAR */}
        {/* On mobile, this becomes an absolute overlay. On desktop, it pushes content. */}
        <aside className={`
          ${isLessonSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 z-40 transition-transform duration-300 ease-in-out flex flex-col
          md:relative md:translate-x-0 ${!isLessonSidebarOpen && 'md:hidden'}
        `}>
          <div className="p-4 border-b border-gray-200 font-semibold bg-gray-50 shrink-0">
            Course Content
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {course.sections.map((section, sIdx) => (
              <div key={section.id} className="border-b border-gray-100 last:border-0">
                
                {/* Section Header */}
                <div className="p-4 bg-gray-50/50">
                  <h3 className="font-semibold text-sm">Section {sIdx + 1}: {section.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">0 / {section.lessons.length} | {section.lessons.reduce((acc, curr) => acc + curr.duration, 0)} min</p>
                </div>

                {/* Lessons List */}
                <ul className="py-2">
                  {section.lessons.map((lesson, lIdx) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = false; // Mock state
                    
                    return (
                      <li key={lesson.id}>
                        <button 
                          onClick={() => setActiveLessonId(lesson.id)}
                          className={`w-full flex items-start text-left gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-primary-50/50 border-l-4 border-primary-600 pl-3' : 'border-l-4 border-transparent'}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className={`h-4 w-4 ${isActive ? 'text-primary-600 fill-primary-600/20' : 'text-gray-300'}`} />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm ${isActive ? 'font-medium text-primary-900' : 'text-gray-700'}`}>
                              {lIdx + 1}. {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              {lesson.duration} min
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}
