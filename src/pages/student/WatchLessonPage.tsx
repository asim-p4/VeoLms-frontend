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
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { Lesson, LessonProgress } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { VideoPlayer } from '../../components/lms/VideoPlayer';

export function WatchLessonPage() {
  const { isLessonSidebarOpen, toggleLessonSidebar } = useUiStore();
  const [course, setCourse] = React.useState<Course | null>(null);
  const params = useParams();
  const navigate = useNavigate();
  const { setPlaying } = usePlayerStore();
  
  // Real lesson tracking
  const [activeLessonId, setActiveLessonId] = React.useState<string | null>(null);
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null);
  const [progressData, setProgressData] = React.useState<Record<string, LessonProgress>>({});
  const [isLoadingLesson, setIsLoadingLesson] = React.useState(false);

  // For saving progress
  const saveProgressInterval = React.useRef<NodeJS.Timeout>();
  const currentVideoTime = React.useRef<number>(0);

  React.useEffect(() => {
    const courseId = params.id;
    if (!courseId) return;

    // Fetch course & overall progress & enrollments
    Promise.all([
      api.get(`/courses/${courseId}`),
      api.get(`/progress/${courseId}`),
      api.get('/enrollments/me')
    ]).then(([courseRes, progressRes, enrollmentsRes]) => {
      const c = courseRes.data.data.course;
      setCourse(c);
      
      const p = progressRes.data.data.progress || [];
      const pMap: Record<string, LessonProgress> = {};
      p.forEach((prog: any) => {
        const lessonId = typeof prog.lesson === 'object' ? (prog.lesson._id || prog.lesson.id) : prog.lesson;
        if (lessonId) pMap[lessonId] = prog;
      });
      setProgressData(pMap);

      const enrollments = enrollmentsRes.data.data.enrollments;
      const thisEnrollment = enrollments.find((e: any) => e.course._id === c._id || e.course.id === c.id || e.course === c._id);
      
      let initialLessonId = typeof thisEnrollment?.lastAccessedLesson === 'object' ? thisEnrollment.lastAccessedLesson?._id : thisEnrollment?.lastAccessedLesson;

      if (!initialLessonId && c.sections?.[0]?.lessons?.[0]) {
        // Find the first uncompleted lesson or default to first
        let firstUncompletedId = null;
        for (const section of (c.sections || [])) {
          for (const lesson of (section.lessons || [])) {
            if (lesson && !pMap[lesson._id || lesson.id]?.isCompleted) {
              firstUncompletedId = lesson._id || lesson.id;
              break;
            }
          }
          if (firstUncompletedId) break;
        }
        initialLessonId = firstUncompletedId || c.sections[0].lessons[0]._id || c.sections[0].lessons[0].id;
      }

      if (initialLessonId && !activeLessonId) {
        setActiveLessonId(initialLessonId);
      }
    }).catch(console.error);
  }, [params.id]);

  React.useEffect(() => {
    if (!activeLessonId) return;
    
    setIsLoadingLesson(true);
    api.get(`/lessons/${activeLessonId}`).then(res => {
      setActiveLesson(res.data.data.lesson);
      // Ensure we trigger auto-play when a new lesson is loaded
      setTimeout(() => setPlaying(true), 100);
    }).catch(console.error)
      .finally(() => setIsLoadingLesson(false));

    // Setup 10-second progress ping
    saveProgressInterval.current = setInterval(() => {
      if (activeLessonId && course) {
        api.post('/progress', {
          lessonId: activeLessonId,
          courseId: course._id || course.id,
          watchedSeconds: currentVideoTime.current,
          lastPosition: currentVideoTime.current 
        }).then(res => {
          // Update local progress state if it was just marked completed
          const p = res.data.data.progress;
          const lessonId = typeof p.lesson === 'object' ? (p.lesson._id || p.lesson.id) : p.lesson;
          setProgressData(prev => ({
            ...prev,
            [lessonId]: p
          }));
        }).catch(console.error);
      }
    }, 10000);

    return () => {
      if (saveProgressInterval.current) clearInterval(saveProgressInterval.current);
    };
  }, [activeLessonId, course]);

  // Navigate to next/prev lesson
  const getNextPrevLesson = (direction: 'next' | 'prev'): string | null => {
    if (!course || !activeLessonId) return null;
    const lessons = course.sections?.flatMap(s => s.lessons || []) || [];
    const currentIndex = lessons.findIndex(l => l && ((l._id || l.id) === activeLessonId));
    if (currentIndex === -1) return null;
    
    if (direction === 'next' && currentIndex < lessons.length - 1) {
      return lessons[currentIndex + 1]._id || lessons[currentIndex + 1].id;
    } else if (direction === 'prev' && currentIndex > 0) {
      return lessons[currentIndex - 1]._id || lessons[currentIndex - 1].id;
    }
    return null;
  };

  const handleNextLesson = () => {
    const nextId = getNextPrevLesson('next');
    if (nextId) setActiveLessonId(nextId);
  };

  const handlePrevLesson = () => {
    const prevId = getNextPrevLesson('prev');
    if (prevId) setActiveLessonId(prevId);
  };

  if (!course) return <div className="h-screen w-full flex items-center justify-center"><Skeleton className="h-12 w-12 rounded-full" /></div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      
      {/* Compact Navbar for Learning Mode */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-900 text-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-400 hover:text-white transition-colors" title="Back to Dashboard">
            <ChevronLeft className="h-5 w-5" />
          </button>
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
          {isLoadingLesson ? (
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          ) : (
            <VideoPlayer 
              src={activeLesson?.videoUrl}
              startPosition={progressData[activeLessonId || '']?.lastPosition || 0}
              onTimeUpdate={(time: number) => { currentVideoTime.current = time; }}
              onNextLesson={getNextPrevLesson('next') ? handleNextLesson : undefined}
              onPrevLesson={getNextPrevLesson('prev') ? handlePrevLesson : undefined}
            />
          )}
          
          {/* Lesson Info */}
          <div className="p-8 max-w-4xl">
            {isLoadingLesson ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">{activeLesson?.title}</h2>
                <div className="prose prose-gray max-w-none">
                  <p>{activeLesson?.description || 'No description provided.'}</p>
                </div>
              </>
            )}
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
            {course.sections?.map((section, sIdx) => (
              <div key={section._id} className="border-b border-gray-100 last:border-0">
                
                <div className="p-4 bg-gray-50/50">
                  <h3 className="font-semibold text-sm">Section {sIdx + 1}: {section.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {(section.lessons || []).filter(l => l && progressData[l._id || l.id]?.isCompleted).length} / {section.lessons?.length || 0} | {(section.lessons || []).reduce((acc, curr) => acc + (curr?.duration || 0), 0)} min
                  </p>
                </div>

                {/* Lessons List */}
                <ul className="py-2">
                  {section.lessons?.map((lesson, lIdx) => {
                    const lId = lesson._id || lesson.id;
                    const isActive = lId === activeLessonId;
                    const isCompleted = !!progressData[lId]?.isCompleted;
                    
                    return (
                      <li key={lId}>
                        <button 
                          onClick={() => setActiveLessonId(lId)}
                          className={`w-full flex items-start text-left gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-primary-50/50 border-l-4 border-primary-600 pl-3' : 'border-l-4 border-transparent'}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-primary-600" />
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
