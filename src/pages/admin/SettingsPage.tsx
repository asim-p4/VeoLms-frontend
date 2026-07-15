/**
 * @fileoverview Admin Settings Page
 * Allows the single admin to update their display name and change password.
 * Calls GET /auth/me to load current profile and PATCH /users/me (if available)
 * or displays a clear "coming soon" if not yet implemented on the backend.
 *
 * DESIGN DECISION: Password change is a separate form from profile info so
 * both can succeed or fail independently, giving clearer error messages.
 */
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Settings, User, CheckCircle2, AlertCircle, Loader2, UploadCloud } from 'lucide-react';
import axios from 'axios';
import { api } from '../../lib/axios';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

// ─── Profile Form ─────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Small feedback component ──────────────────────────────────────────────────
function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-md p-3 text-sm ${
      type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
    }`}>
      {type === 'success'
        ? <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
        : <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      }
      {message}
    </div>
  );
}

export function SettingsPage() {
  const { user, login, accessToken } = useAuthStore();

  // ── Profile form state ─────────────────────────────────────────────────────
  const [profileMsg, setProfileMsg] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(false);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const uploadFileToR2 = async (file: File): Promise<string> => {
    // 1. Get Presigned URL
    const { data: presignData } = await api.post('/admin/upload/presign', {
      type: "picture",
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
          setUploadProgress(percentCompleted);
        }
      }
    });

    return publicUrl || key;
  };

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      let avatarUrl = undefined;
      if (avatarFile) {
        avatarUrl = await uploadFileToR2(avatarFile);
      }

      const res = await api.patch('/users/me', { name: data.name, avatar: avatarUrl });
      // Update the in-memory auth store so the navbar reflects the change
      if (accessToken) login({ ...user!, name: res.data.data.user.name, avatar: res.data.data.user.avatar || user!.avatar }, accessToken);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
      setAvatarFile(null);
      setUploadProgress(0);
    } catch (err: any) {
      // Endpoint may not exist yet — show a helpful message either way
      const msg = err.response?.data?.message ?? 'Failed to update profile. Backend endpoint may not be implemented yet.';
      setProfileMsg({ type: 'error', text: msg });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary-600" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account profile and security.</p>
      </div>

      {/* ── Profile Info ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-gray-500" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Admin info badge */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl flex-shrink-0">
                {(user?.name ?? 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                Administrator
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Profile Picture (Image)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
                <UploadCloud className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                {avatarFile ? <p className="text-primary-600 font-medium text-sm">{avatarFile.name}</p> : <p className="text-gray-500 text-sm">Upload Avatar</p>}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <Input
                id="settings-name"
                placeholder="Your name"
                {...profileForm.register('name')}
                className={profileForm.formState.errors.name ? 'border-red-400' : ''}
              />
              {profileForm.formState.errors.name && (
                <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                id="settings-email"
                type="email"
                disabled
                {...profileForm.register('email')}
                className="bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400">
                Email cannot be changed here. Update it via the seed script and database.
              </p>
            </div>

            {profileMsg && <Feedback type={profileMsg.type} message={profileMsg.text} />}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={profileLoading} id="btn-save-profile">
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>


    </div>
  );
}
