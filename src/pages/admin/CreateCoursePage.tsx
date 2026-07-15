import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../lib/axios';
import * as z from 'zod';
import { ArrowLeft, UploadCloud, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import axios from 'axios';

const createCourseSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  instructorName: z.string().min(2, 'Instructor name is required'),
  instructorBio: z.string().min(10, 'Instructor bio must be at least 10 characters'),
  price: z.number({ invalid_type_error: "Price must be a number" }).min(0, 'Price must be 0 or greater'),
  discountPrice: z.number({ invalid_type_error: "Discount price must be a number" }).min(0, 'Discount must be 0 or greater').optional().or(z.literal('')),
});
type CreateCourseData = z.infer<typeof createCourseSchema>;

export function CreateCoursePage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  // File States
  const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
  const [trailerFile, setTrailerFile] = React.useState<File | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateCourseData>({
    resolver: zodResolver(createCourseSchema)
  });

  const uploadFileToR2 = async (file: File, type: string, id: string): Promise<string> => {
    // 1. Get Presigned URL
    const { data: presignData } = await api.post('/admin/upload/presign', {
      type,
      filename: file.name,
      contentType: file.type
    });
    const { uploadUrl, key, publicUrl } = presignData.data;

    // 2. Upload to R2 directly with progress
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(prev => ({ ...prev, [id]: percentCompleted }));
        }
      }
    });

    return publicUrl || key;
  };

  const onSubmit = async (data: CreateCourseData) => {
    try {
      setIsLoading(true);

      let thumbnailUrl = '';
      let trailerUrl = '';
      let instructorAvatarUrl = '';

      // Upload media concurrently if selected
      const uploadPromises = [];
      if (thumbnailFile) uploadPromises.push(uploadFileToR2(thumbnailFile, 'picture', 'thumbnail').then(url => thumbnailUrl = url));
      if (trailerFile) uploadPromises.push(uploadFileToR2(trailerFile, 'video', 'trailer').then(url => trailerUrl = url));
      if (avatarFile) uploadPromises.push(uploadFileToR2(avatarFile, 'picture', 'avatar').then(url => instructorAvatarUrl = url));
      
      await Promise.all(uploadPromises);

      // Create Course
      const res = await api.post('/admin/courses', {
        ...data,
        price: data.price * 100, // convert USD to cents
        discountPrice: data.discountPrice ? Number(data.discountPrice) * 100 : undefined,
        thumbnail: thumbnailUrl || undefined,
        trailerUrl: trailerUrl || undefined,
        instructorAvatar: instructorAvatarUrl || undefined,
      });

      const courseId = res.data.data.course._id || res.data.data.course.id;
      
      // Redirect to Curriculum Editor
      navigate(`/admin/courses/${courseId}/edit`);

    } catch (err) {
      console.error(err);
      alert('Failed to create course. Ensure R2 is configured.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/courses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-sm text-gray-500">Fill in the details below to initialize your course.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <Input {...register('title')} placeholder="e.g. Advanced React Patterns" className={errors.title ? 'border-red-500' : ''} />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                {...register('description')}
                className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                rows={4}
                placeholder="Briefly describe what students will learn..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <Input type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="e.g. 49.99" className={errors.price ? 'border-red-500' : ''} />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price ($)</label>
                <Input type="number" step="0.01" {...register('discountPrice', { setValueAs: v => v === "" ? "" : Number(v) })} placeholder="e.g. 29.99 (optional)" className={errors.discountPrice ? 'border-red-500' : ''} />
                {errors.discountPrice && <p className="text-red-500 text-xs mt-1">{errors.discountPrice.message as string}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Info */}
        <Card>
          <CardHeader>
            <CardTitle>Course Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail (Image)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
                <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {thumbnailFile ? <p className="text-primary-600 font-medium">{thumbnailFile.name}</p> : <p className="text-gray-500 text-sm">Click or drag image to upload</p>}
              </div>
              {uploadProgress['thumbnail'] !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['thumbnail']}%` }}></div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Trailer (Video)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input type="file" accept="video/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setTrailerFile(e.target.files?.[0] || null)} />
                <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {trailerFile ? <p className="text-primary-600 font-medium">{trailerFile.name}</p> : <p className="text-gray-500 text-sm">Click or drag video to upload</p>}
              </div>
              {uploadProgress['trailer'] !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['trailer']}%` }}></div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Creator Info */}
        <Card>
          <CardHeader>
            <CardTitle>Creator Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Name</label>
              <Input {...register('instructorName')} placeholder="e.g. Jane Doe" className={errors.instructorName ? 'border-red-500' : ''} />
              {errors.instructorName && <p className="text-red-500 text-xs mt-1">{errors.instructorName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor Bio</label>
              <textarea 
                {...register('instructorBio')}
                className={`w-full rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.instructorBio ? 'border-red-500' : 'border-gray-200'}`}
                rows={3}
                placeholder="Senior Software Engineer with 10 years of experience..."
              />
              {errors.instructorBio && <p className="text-red-500 text-xs mt-1">{errors.instructorBio.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Avatar (Image)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                <UploadCloud className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                {avatarFile ? <p className="text-primary-600 font-medium text-sm">{avatarFile.name}</p> : <p className="text-gray-500 text-sm">Upload Avatar</p>}
              </div>
              {uploadProgress['avatar'] !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${uploadProgress['avatar']}%` }}></div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? 'Creating Course & Uploading Media...' : 'Create Course & Continue to Curriculum'}
          </Button>
        </div>
      </form>
    </div>
  );
}
