/**
 * @fileoverview Main Layout Wrapper
 * Used for public pages and student dashboard. 
 * Centers content and enforces maximum widths.
 * 
 * @component
 * @example
 * <MainLayout>
 *   <HomePage />
 * </MainLayout>
 */
import * as React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Navbar />
      <main className="flex-1">
        {/* Child pages handle their own container boundaries if they need full bleed */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
