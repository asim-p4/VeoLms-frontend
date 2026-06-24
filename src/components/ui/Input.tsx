/**
 * @fileoverview Input Component
 * Standard form input primitive. Integrates seamlessly with React Hook Form.
 * 
 * @component
 * @example
 * <Input 
 *   type="email" 
 *   placeholder="Enter your email" 
 *   {...register('email')} 
 * />
 * 
 * RESPONSIVE:
 * - Font size defaults to 16px (text-base on mobile) to prevent iOS auto-zoom on focus.
 */
import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm md:text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
