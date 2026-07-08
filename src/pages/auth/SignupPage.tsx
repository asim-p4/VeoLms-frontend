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
import { BookOpen, Check, X, Loader2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

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

  /**
   * Mock form submission
   */
  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      const { data: resData } = await api.post('/auth/signup', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      const user = resData.data.user;
      const accessToken = resData.data.accessToken;
      
      login(user, accessToken);
      toast.success("Account created successfully!");
      // Client-side navigation: no full page reload, no re-trigger of checkAuth
      navigate("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
                      className={`flex-1 rounded-full ${
                        strengthScore >= level
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
