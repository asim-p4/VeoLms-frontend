/**
 * @fileoverview Admin specific Layout Wrapper
 * Features a specialized header and persistent sidebar layout.
 * 
 * @component
 * @example
 * <AdminLayout>
 *   <CourseManagementPage />
 * </AdminLayout>
 */
import * as React from 'react';
import { Navbar } from './Navbar';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Admin can share the same top navbar, but we could customize it further */}
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
