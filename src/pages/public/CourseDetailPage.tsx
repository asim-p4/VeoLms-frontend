/**
 * @fileoverview Course Detail Page
 * Detailed view of a single course. Designed to act as a sales/landing page for that specific course.
 */
import * as React from 'react';
import { PlayCircle, Clock, Users, Star, Check, CheckCircle2, X } from 'lucide-react';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id || 'react-masterclass'; 
  const [course, setCourse] = React.useState<Course | null>(null);
  const [isEnrolling, setIsEnrolling] = React.useState(false);
  const [isEnrolled, setIsEnrolled] = React.useState(false);
  const [isUnenrolling, setIsUnenrolling] = React.useState(false);
  const [showTrailerModal, setShowTrailerModal] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  React.useEffect(() => {
    api.get(`/courses/${courseId}`).then(res => setCourse(res.data.data.course)).catch(console.error);
    
    if (user) {
      api.get('/enrollments/me').then(res => {
        const enrollments = res.data.data.enrollments;
        const enrolled = enrollments.some((e: any) => 
          e.course?._id === courseId || 
          e.course?.slug === courseId || 
          e.course?.id === courseId ||
          (course && (e.course?._id === course._id || e.course?.slug === course.slug))
        );
        setIsEnrolled(enrolled);
      }).catch(console.error);
    }
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role?.toLowerCase() === 'admin') {
      alert("Admins cannot enroll in courses. This is a preview mode.");
      return;
    }
    
    if (isEnrolled) {
      navigate(`/learn/${course?.slug || courseId}`);
      return;
    }

    try {
      setIsEnrolling(true);
      
      const price = course?.discountPrice || course?.price || 0;
      
      if (price > 0) {
        // Paid course -> Create Stripe Checkout Session
        const res = await api.post('/payments/create-checkout-session', { courseId: course?._id || course?.id });
        if (res.data.data.checkoutUrl) {
          window.location.href = res.data.data.checkoutUrl;
        }
      } else {
        // Free course -> Direct enrollment
        await api.post('/enrollments', { courseId: course?._id || course?.id });
        setIsEnrolled(true);
        navigate(`/learn/${course?.slug || courseId}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to enroll or initiate payment. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm("Do you want to unenroll from this course to test the 'Buy Course' checkout flow?")) {
      return;
    }
    try {
      setIsUnenrolling(true);
      await api.delete(`/enrollments/${course?._id || courseId}`);
      setIsEnrolled(false);
      setStatusMessage("Unenrolled successfully! You can now test the 'Buy Course' flow.");
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      console.error("Failed to unenroll:", err);
      alert(err.response?.data?.message || "Failed to unenroll. Please try again.");
    } finally {
      setIsUnenrolling(false);
    }
  };

  if (!course) {
    return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  }

  const effectivePrice = course.discountPrice || course.price || 0;
  const formattedPrice = (effectivePrice / 100).toFixed(2);

  return (
    <div className="bg-white min-h-screen">
      {/* Trailer Modal Overlay */}
      {showTrailerModal && course.trailerUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div 
            className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800 text-white">
              <h3 className="font-semibold text-lg truncate pr-4">{course.title} — Course Trailer</h3>
              <button 
                onClick={() => setShowTrailerModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                title="Close trailer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video 
                src={course.trailerUrl} 
                controls 
                autoPlay 
                playsInline 
                poster={course.thumbnail}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Banner - Dark Mode aesthetic */}
      <div className="bg-gray-900 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
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
            
            <p className="text-sm text-gray-400">Created by <span className="underline">{course.instructorName || (course.instructor as any)?.name}</span></p>
          </div>

          {/* Floating Course Sales Card */}
          <div className="md:col-span-1">
            <div className="bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-100 md:absolute top-24 right-[10%] w-full md:w-80 z-10">
              <div 
                className="relative aspect-video group cursor-pointer overflow-hidden"
                onClick={() => {
                  if (course.trailerUrl) setShowTrailerModal(true);
                  else alert("No trailer available for this course.");
                }}
                title="Click to preview trailer"
              >
                <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-full group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-14 w-14 text-white drop-shadow-md" />
                  </div>
                  <span className="text-white text-xs font-semibold mt-2 tracking-wide uppercase bg-black/60 px-3 py-1 rounded-full">Preview Course</span>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {statusMessage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg">
                    {statusMessage}
                  </div>
                )}

                {!isEnrolled && (
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold">${formattedPrice}</span>
                    {course.discountPrice && (
                      <span className="text-lg text-gray-500 line-through mb-1">${(course.price / 100).toFixed(2)}</span>
                    )}
                  </div>
                )}
                
                {user?.role?.toLowerCase() === 'admin' ? (
                  <div className="w-full text-center py-3 bg-gray-100 text-gray-500 font-medium rounded-md border border-dashed border-gray-300">
                    Admin Preview Mode
                  </div>
                ) : isEnrolled ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">You own this course!</p>
                        <p className="text-xs text-emerald-700">You have active access to all lessons and materials.</p>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full text-lg h-12 bg-primary-600 hover:bg-primary-700 font-semibold" 
                      onClick={() => navigate(`/learn/${course.slug || course._id || courseId}`)}
                    >
                      Continue Course →
                    </Button>

                    <button
                      type="button"
                      onClick={handleUnenroll}
                      disabled={isUnenrolling}
                      className="w-full text-center text-xs text-gray-500 hover:text-red-600 underline transition-colors pt-1 block"
                      title="Reset enrollment to test purchase"
                    >
                      {isUnenrolling ? 'Unenrolling...' : '[Test Mode] Unenroll to test "Buy Course" button'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      size="lg" 
                      className="w-full text-lg h-12 bg-primary-600 hover:bg-primary-700 font-semibold shadow-lg shadow-primary-500/20" 
                      onClick={handleEnroll} 
                      disabled={isEnrolling}
                    >
                      {isEnrolling 
                        ? 'Processing...' 
                        : (effectivePrice > 0 
                            ? `Buy Course — $${formattedPrice}` 
                            : 'Enroll in Free Course')}
                    </Button>
                    <p className="text-center text-xs text-gray-500">30-Day Money-Back Guarantee • Lifetime Access</p>
                  </div>
                )}
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-3"><Clock className="h-4 w-4" /> {course.totalDuration ? (course.totalDuration / 60).toFixed(1) : 0} hours on-demand video</div>
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
        
        {course.trailerUrl && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Course Trailer</h2>
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
               <video 
                 src={course.trailerUrl} 
                 controls 
                 playsInline
                 preload="metadata"
                 poster={course.thumbnail}
                 className="w-full h-full object-contain" 
               />
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-6">Course Content</h2>
        
        {/* Accordion-style Curriculum Mock */}
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-12">
          {course.sections?.map((section, idx) => (
            <div key={section._id || idx} className={`border-b border-gray-200 last:border-0 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="p-4 flex justify-between items-center font-medium">
                <span>{section.title}</span>
                <span className="text-sm text-gray-500">{section.lessons?.length || 0} lectures</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start p-6 border border-gray-200 rounded-xl bg-white">
          <img 
            src={course.instructorAvatar || (course.instructor as any)?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(course.instructorName || (course.instructor as any)?.name || 'Instructor')} 
            alt={course.instructorName || (course.instructor as any)?.name} 
            className="w-24 h-24 rounded-full object-cover" 
          />
          <div>
            <h3 className="text-xl font-bold">{course.instructorName || (course.instructor as any)?.name}</h3>
            <p className="text-gray-500 mb-4">{course.instructorBio || (course.instructor as any)?.bio || 'Instructor at VeoLMS'}</p>
            <div className="flex gap-4 text-sm font-medium text-gray-700">
              <span>{(course.instructor as any)?.studentsCount?.toLocaleString() || 0} Students</span>
              <span>{(course.instructor as any)?.coursesCount || 0} Courses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

