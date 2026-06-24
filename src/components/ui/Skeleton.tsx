/**
 * @fileoverview Skeleton Loading Component
 * Used to render placeholders while data is loading, preventing layout shift.
 * 
 * @component
 * @example
 * // Card Skeleton
 * <div className="space-y-3">
 *   <Skeleton className="h-[125px] w-[250px] rounded-xl" />
 *   <div className="space-y-2">
 *     <Skeleton className="h-4 w-[250px]" />
 *     <Skeleton className="h-4 w-[200px]" />
 *   </div>
 * </div>
 */
import * as React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200/60 dark:bg-gray-800', className)}
      {...props}
    />
  );
}
