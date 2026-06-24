/**
 * @fileoverview Universal Login Page
 * Handles authentication for ALL users (Students & Admin).
 * 
 * SECURITY/DESIGN:
 * - Validates input locally via Zod before hitting API
 * - Uses Zustand authStore to persist session
 * - Redirects dynamically based on returned user role
 * 
 * TODO: Replace `window.location.href` with React Router's `useNavigate` once routing is configured.
 */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/mockApi';

/** Form validation schema using Zod */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isLoading, setLoading, error, setError } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handles form submission and mock API authentication
   * @param {LoginFormValues} data - Validated form data
   */
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = await api.login(data.email, data.password);
      login(user); // Save to Zustand

      // Redirect based on role
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <BookOpen className="h-10 w-10 text-primary-600 mb-2" />
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <a href="/signup" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              create a new student account
            </a>
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-md bg-error/10 p-4 border border-error/20 flex items-start gap-3 text-error">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register('email')}
                className={errors.email ? 'border-error focus-visible:ring-error' : ''}
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={() => alert('Mock: Password reset email sent!')}
                  className="text-xs font-medium text-primary-600 hover:text-primary-500"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password')}
                className={errors.password ? 'border-error focus-visible:ring-error' : ''}
              />
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        {/* Dev-only Mock Credentials Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800">
            <p className="font-semibold mb-1">Development Mock Credentials:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Admin: admin@veolms.com / Admin@123!</li>
              <li>Student: rahul@example.com / Student@123</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
