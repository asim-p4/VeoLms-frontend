/**
 * @fileoverview Application Navigation Bar
 * Responsive top navigation adjusting its links based on user authentication and role.
 * 
 * DESIGN:
 * - Transparent/blur effect on scroll (glassmorphism)
 * - Hamburger menu on mobile (<640px)
 * 
 * TODO: Add actual React Router <Link> components once routing is set up.
 * TODO: Implement search bar dropdown in desktop view.
 */

import { useState, useRef, useEffect } from 'react';
import { Menu, BookOpen, LogOut, User as UserIcon, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          <a href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <BookOpen className="h-6 w-6" />
            <span>VeoLMS</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/courses" className="text-gray-600 hover:text-primary-600 transition-colors">Categories</a>
          
          {/* Search bar removed per user request */}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {!user ? (
            // Public State
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <a href="/login">Log in</a>
              </Button>
              <Button asChild>
                <a href="/signup">Sign up</a>
              </Button>
            </>
          ) : (
            // Authenticated State
            <div className="flex items-center gap-4">
              <a href={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-sm font-medium hover:text-primary-600 hidden sm:block">
                {user.role === 'admin' ? 'Admin Panel' : 'My Learning'}
              </a>
              <div className="relative" ref={profileRef}>
                <div 
                  className="cursor-pointer flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-700"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-5 w-5" />
                  )}
                </div>
                
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-48 flex-col rounded-md border border-gray-200 bg-white shadow-lg flex">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' ? (
                      <a href="/admin/settings" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</a>
                    ) : null}
                    <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-gray-50 text-left">
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex flex-col px-4 py-4 gap-4">
            <a href="/courses" className="text-gray-600 hover:text-primary-600 font-medium">Categories</a>
            {!user ? (
              <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-gray-100">
                <Button variant="ghost" asChild className="w-full justify-start">
                  <a href="/login">Log in</a>
                </Button>
                <Button asChild className="w-full justify-start">
                  <a href="/signup">Sign up</a>
                </Button>
              </div>
            ) : (
              <div className="mt-2 pt-4 border-t border-gray-100">
                <a href={user.role === 'admin' ? '/admin' : '/dashboard'} className="block text-gray-600 hover:text-primary-600 font-medium py-2">
                  {user.role === 'admin' ? 'Admin Panel' : 'My Learning'}
                </a>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
