import * as React from 'react';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <a 
      href={`/courses/${course.slug || course._id || course.id}`} 
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video w-full overflow-hidden relative">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered && course.trailerUrl ? 'opacity-0' : 'opacity-100'}`} 
        />
        {course.trailerUrl && (
          <video
            ref={videoRef}
            src={course.trailerUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            loop
            muted
            playsInline
          />
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors flex-1">{course.title}</h3>
        <p className="text-sm text-gray-500 mb-2">{course.instructorName || (course.instructor as any)?.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">
            ${((course.discountPrice || course.price || 0) / 100).toLocaleString()}
          </span>
          {course.discountPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${((course.price || 0) / 100).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
