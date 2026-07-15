/**
 * @fileoverview Universal Login Page
 * Handles authentication for both Students and Admin via a tab toggle.
 *
 * DESIGN DECISIONS:
 * - Admin uses POST /auth/admin/login — returns 403 if a student tries it.
 * - Student uses POST /auth/login — the general endpoint.
 * - Single page avoids duplicating form markup; `loginMode` drives endpoint + copy.
 * - Redirects based on returned user.role so either tab can't "guess" the endpoint.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BookOpen, AlertCircle, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/axios';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginMode = 'student' | 'admin';

export function LoginPage() {
  const [loginMode, setLoginMode] = useState<LoginMode>('student');
  const { login, isLoading, setLoading, error, setError } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleTabChange = (mode: LoginMode) => {
    setLoginMode(mode);
    setError(null);
    reset();
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);

      // Admin has a dedicated endpoint that enforces role === 'admin' server-side.
      // Students use the shared login endpoint.
      const endpoint = loginMode === 'admin' ? '/auth/admin/login' : '/auth/login';

      const { data: resData } = await api.post(endpoint, {
        email: data.email,
        password: data.password,
      });

      const user = resData.data.user;
      const accessToken = resData.data.accessToken;

      login(user, accessToken);

      // Route based on actual role returned from server (source of truth)
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

        {/* Header */}
        <div className="flex flex-col items-center">
          <BookOpen className="h-10 w-10 text-primary-600 mb-2" />
          <h1 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            Sign in to VeoLMS
          </h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            Welcome back! Please select your account type.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 gap-1 bg-gray-50">
          <button
            type="button"
            id="tab-student"
            onClick={() => handleTabChange('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              loginMode === 'student'
                ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Student
          </button>
          <button
            type="button"
            id="tab-admin"
            onClick={() => handleTabChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              loginMode === 'admin'
                ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={loginMode === 'admin' ? 'admin@veolms.com' : 'you@example.com'}
              {...register('email')}
              className={errors.email ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-400 focus-visible:ring-red-400' : ''}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            id="btn-login-submit"
            className="w-full flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              `Sign in as ${loginMode === 'admin' ? 'Admin' : 'Student'}`
            )}
          </Button>
        </form>

        {/* Footer link — only shown for student tab */}
        {loginMode === 'student' && (
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Create a student account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
