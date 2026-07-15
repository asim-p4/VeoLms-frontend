/**
 * @fileoverview Student Registration Page
 * Allows new users to create student accounts.
 *
 * RULES:
 * - Strict password complexity requirements (Zod regex).
 * - Visual password strength indicator implemented directly.
 * - Admin accounts CANNOT be registered here.
 */
// import * as React from 'react';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpen, Check, X, Loader2, User, Mail, ArrowLeft } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { api } from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

/** Strict registration validation schema */
const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { terms: false },
  });

  const watchPassword = watch("password", "");

  // Calculate visual password strength
  const hasMinLength = watchPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(watchPassword);
  const hasNumber = /[0-9]/.test(watchPassword);
  const hasSpecial = /[^a-zA-Z0-9]/.test(watchPassword);

  const strengthScore = [hasMinLength, hasUpper, hasNumber, hasSpecial].filter(
    Boolean,
  ).length;

  const uploadFileToR2 = async (file: File): Promise<string> => {
    // 1. Get Presigned URL from public auth route
    const { data: presignData } = await api.post('/auth/upload/presign', {
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

  /**
   * Mock form submission -> Real form submission
   */
  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);

      let avatarUrl = '';
      if (avatarFile) {
        avatarUrl = await uploadFileToR2(avatarFile);
      }

      const { data: resData } = await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password,
        avatar: avatarUrl || undefined
      });

      setRegisteredEmail(data.email);
      setStep(2);
      toast.success(resData.message || "Verification code sent to your email.");
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      setIsVerifying(true);
      const { data: resData } = await api.post('/auth/verify-email', {
        email: registeredEmail,
        code: verificationCode
      });

      const user = resData.data.user;
      const accessToken = resData.data.accessToken;

      login(user, accessToken);
      toast.success("Account verified successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsVerifying(true);
      await api.post('/auth/resend-code', { email: registeredEmail });
      toast.success("New verification code sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setStep(1)}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>

          <div className="flex flex-col items-center">
            <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We've sent a 6-digit verification code to <br />
              <span className="font-medium text-gray-900">{registeredEmail}</span>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleVerify}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="text-center text-2xl tracking-widest h-14"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isVerifying || verificationCode.length !== 6}>
              {isVerifying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify Account"
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isVerifying}
                  className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
              <p className="text-xs text-gray-400 mt-2">Code expires in 15 minutes</p>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center">
          <BookOpen className="h-10 w-10 text-primary-600 mb-2" />
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900">
            Create a student account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Log in
            </a>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className={
                errors.name ? "border-error focus-visible:ring-error" : ""
              }
            />
            {errors.name && (
              <p className="mt-1 text-xs text-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              <User className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              {avatarFile ? <p className="text-primary-600 font-medium text-sm">{avatarFile.name}</p> : <p className="text-gray-500 text-sm">Upload Avatar</p>}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={
                errors.email ? "border-error focus-visible:ring-error" : ""
              }
            />
            {errors.email && (
              <p className="mt-1 text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={
                errors.password ? "border-error focus-visible:ring-error" : ""
              }
            />

            {/* Visual Password Strength Indicator */}
            {watchPassword.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full ${strengthScore >= level
                          ? strengthScore === 4
                            ? "bg-success"
                            : strengthScore >= 2
                              ? "bg-warning"
                              : "bg-error"
                          : "bg-gray-200"
                        }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {hasMinLength ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}{" "}
                    8+ characters
                  </div>
                  <div className="flex items-center gap-1">
                    {hasUpper ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}{" "}
                    Uppercase
                  </div>
                  <div className="flex items-center gap-1">
                    {hasNumber ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}{" "}
                    Number
                  </div>
                  <div className="flex items-center gap-1">
                    {hasSpecial ? (
                      <Check className="h-3 w-3 text-success" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}{" "}
                    Special Char
                  </div>
                </div>
              </div>
            )}
            {errors.password && !watchPassword && (
              <p className="mt-1 text-xs text-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={
                errors.confirmPassword
                  ? "border-error focus-visible:ring-error"
                  : ""
              }
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                type="checkbox"
                {...register("terms")}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
              {errors.terms && (
                <p className="mt-1 text-xs text-error">
                  {errors.terms.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
