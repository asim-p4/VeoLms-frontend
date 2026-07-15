import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, BookOpen, Clock, Ban, CheckCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    thumbnail: string;
    price: number;
  };
  enrolledAt: string;
  progressPercentage: number;
  status: string;
  isActive: boolean;
}

interface StudentDetails {
  student: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    avatar?: string;
  };
  enrollments: Enrollment[];
}

export function StudentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = React.useState<StudentDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  const fetchStudentDetails = React.useCallback(async () => {
    try {
      const res = await api.get(`/admin/students/${id}`);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load student details');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const toggleAccess = async (enrollmentId: string, currentStatus: boolean) => {
    setTogglingId(enrollmentId);
    try {
      await api.patch(`/admin/enrollments/${enrollmentId}/status`, {
        isActive: !currentStatus
      });
      toast.success(`Access ${!currentStatus ? 'enabled' : 'revoked'}`);
      fetchStudentDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update access');
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Student Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/students')}>
          Back to Students
        </Button>
      </div>
    );
  }

  const { student, enrollments } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Student Details</h1>
      </div>

      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          {student.avatar ? (
            <img src={student.avatar} alt={student.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-3xl">
              {student.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
            <p className="text-gray-500">{student.email}</p>
            <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Joined {new Date(student.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-500" />
          Enrolled Courses ({enrollments.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <Card key={enrollment._id} className={!enrollment.isActive ? 'opacity-75 bg-gray-50' : ''}>
            <img 
              src={enrollment.course.thumbnail} 
              alt={enrollment.course.title} 
              className="w-full h-32 object-cover rounded-t-lg grayscale-0"
              style={{ filter: !enrollment.isActive ? 'grayscale(100%)' : 'none' }}
            />
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 line-clamp-1">{enrollment.course.title}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-gray-700">
                  <span>Progress</span>
                  <span>{enrollment.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-primary-600 h-1.5 rounded-full" 
                    style={{ width: `${enrollment.progressPercentage}%` }} 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  enrollment.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {enrollment.isActive ? 'Active Access' : 'Revoked Access'}
                </span>
                <Button 
                  size="sm" 
                  variant={enrollment.isActive ? "destructive" : "default"}
                  disabled={togglingId === enrollment._id}
                  onClick={() => toggleAccess(enrollment._id, enrollment.isActive)}
                  className="h-8"
                >
                  {togglingId === enrollment._id ? 'Updating...' : (
                    enrollment.isActive ? <><Ban className="h-3 w-3 mr-1" /> Revoke</> : <><CheckCircle className="h-3 w-3 mr-1" /> Enable</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {enrollments.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 border border-dashed rounded-lg">
            This student has not enrolled in any courses yet.
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
