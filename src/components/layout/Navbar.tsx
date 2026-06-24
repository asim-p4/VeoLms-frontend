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
import * as React from 'react';
import { Menu, Search, BookOpen, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        
        {/* Logo & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            onClick={toggleSidebar}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <a href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <BookOpen className="h-6 w-6" />
            <span>VeoLMS</span>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/courses" className="text-gray-600 hover:text-primary-600 transition-colors">Categories</a>
          
          {/* Global Search Bar (Desktop) */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary-500" />
            <input 
              type="text" 
              placeholder="Search for courses..." 
              className="h-10 w-64 rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
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
              <div className="relative group cursor-pointer flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-700">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )}
                
                {/* Simple Dropdown Mock */}
                <div className="absolute right-0 top-12 hidden w-48 flex-col rounded-md border border-gray-200 bg-white shadow-lg group-hover:flex">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-error hover:bg-gray-50 text-left">
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
