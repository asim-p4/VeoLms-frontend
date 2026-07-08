/**
 * @fileoverview Admin Navigation Sidebar
 * Persistent left-hand sidebar for administrative routes.
 * 
 * RESPONSIVE:
 * - Hidden on mobile, replaced by a drawer (mocked via uiStore logic later).
 */

import { LayoutDashboard, Book, Users, BarChart, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AdminSidebar() {
  const currentPath = window.location.pathname; // Mock routing check
  
  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Courses', icon: Book, path: '/admin/courses' },
    { name: 'Students', icon: Users, path: '/admin/students' },
    { name: 'Analytics', icon: BarChart, path: '/admin/analytics' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden md:block h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <a
              key={link.name}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary-50 text-primary-700" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <link.icon className={cn("h-5 w-5", isActive ? "text-primary-600" : "text-gray-400")} />
              {link.name}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
