import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Course } from '../../types';
import { ArrowLeft, Plus, Trash2, Video, GripVertical } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import axios from 'axios';

export function EditCoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = React.useState<Course | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // New Section State
  const [newSectionTitle, setNewSectionTitle] = React.useState('');

  // New Lesson State
  const [activeSectionForLesson, setActiveSectionForLesson] = React.useState<string | null>(null);
  const [newLessonData, setNewLessonData] = React.useState({ title: '', duration: 0, videoUrl: '' });
  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  React.useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/courses/${id}`);
      setCourse(res.data.data.course);
    } catch (err) {
      console.error(err);
      alert('Failed to load course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      await api.post(`/admin/courses/${id}/sections`, {
        title: newSectionTitle,
        order: (course?.sections?.length || 0) + 1
      });
      setNewSectionTitle('');
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Failed to create section');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section and all its lessons?')) return;
    try {
      await api.delete(`/admin/sections/${sectionId}`);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Failed to delete section');
    }
  };

  const handleCreateLesson = async (sectionId: string) => {
    if (!newLessonData.title.trim()) return;
    try {
      setIsUploading(true);
      
      const uploadFileToR2 = async (file: File, type: string): Promise<string> => {
        // 1. Get Presigned URL
        const { data: presignData } = await api.post('/admin/upload/presign', {
          type,
          filename: file.name,
          contentType: file.type || 'video/mp4'
        });
        const { uploadUrl, key } = presignData.data;

        // 2. Upload to R2 directly (bypassing our server)
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type || 'video/mp4'
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        });
        return key;
      };

      let finalVideoUrl = newLessonData.videoUrl;
      if (videoFile) {
        finalVideoUrl = await uploadFileToR2(videoFile, 'video');
      }

      const section = course?.sections.find(s => (s._id || s.id) === sectionId);
      await api.post(`/admin/sections/${sectionId}/lessons`, {
        ...newLessonData,
        videoUrl: finalVideoUrl,
        order: (section?.lessons?.length || 0) + 1
      });
      setActiveSectionForLesson(null);
      setNewLessonData({ title: '', duration: 0, videoUrl: '' });
      setVideoFile(null);
      setUploadProgress(0);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Failed to create lesson. Please ensure your R2 credentials are set up in .env.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/admin/lessons/${lessonId}`);
      fetchCourse();
    } catch (err) {
      console.error(err);
      alert('Failed to delete lesson');
    }
  };

  if (isLoading || !course) return <div className="p-8 text-center">Loading course...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/courses')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-sm text-gray-500">{course.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/courses/${course.slug || course._id}`)}>
            View Public Page
          </Button>
          <Button onClick={async () => {
            try {
              await api.patch(`/admin/courses/${id}`, { isPublished: !course.isPublished });
              fetchCourse();
            } catch(e) { alert('Failed to toggle publish status'); }
          }}>
            {course.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Curriculum Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {course.sections?.map((section, sIdx) => {
            const sectionId = section._id || section.id;
            return (
              <div key={sectionId} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Section Header */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <span className="font-semibold text-gray-900">Section {sIdx + 1}: {section.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setActiveSectionForLesson(sectionId)}>
                      <Plus className="h-4 w-4 mr-1" /> Add Lesson
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(sectionId)}>
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                </div>

                {/* Lessons */}
                <div className="divide-y divide-gray-100">
                  {section.lessons?.map((lesson, lIdx) => {
                    const lessonId = lesson._id || lesson.id;
                    return (
                      <div key={lessonId} className="px-4 py-3 flex items-center justify-between group hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Video className="h-4 w-4 text-primary-500" />
                          <span className="text-sm font-medium text-gray-700">Lesson {lIdx + 1}: {lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{lesson.duration} min</span>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(lessonId)}>
                            <Trash2 className="h-4 w-4 text-error" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Lesson Form */}
                  {activeSectionForLesson === sectionId && (
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-3">
                      <Input 
                        placeholder="Lesson Title" 
                        value={newLessonData.title}
                        onChange={e => setNewLessonData({...newLessonData, title: e.target.value})}
                      />
                            <Input 
                              type="file" 
                              accept="video/*"
                              onChange={e => {
                                const file = e.target.files?.[0] || null;
                                setVideoFile(file);
                                if (file) {
                                  // Extract video duration automatically
                                  const videoElement = document.createElement('video');
                                  videoElement.preload = 'metadata';
                                  videoElement.onloadedmetadata = () => {
                                    window.URL.revokeObjectURL(videoElement.src);
                                    const durationMinutes = Math.ceil(videoElement.duration / 60);
                                    setNewLessonData(prev => ({...prev, duration: durationMinutes}));
                                  };
                                  videoElement.src = URL.createObjectURL(file);
                                }
                              }}
                              className="w-full"
                              disabled={isUploading}
                            />
                        
                        {isUploading && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            <p className="text-xs text-gray-500 mt-1 text-right">{uploadProgress}% Uploading to R2...</p>
                          </div>
                        )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => {
                          setActiveSectionForLesson(null);
                          setVideoFile(null);
                        }} disabled={isUploading}>Cancel</Button>
                        <Button size="sm" onClick={() => handleCreateLesson(sectionId)} disabled={isUploading}>
                          {isUploading ? 'Saving...' : 'Save Lesson'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Section Form */}
          <div className="flex gap-2">
            <Input 
              placeholder="New Section Title..." 
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleCreateSection}>Add Section</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
