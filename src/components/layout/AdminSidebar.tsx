/**
 * @fileoverview Admin Navigation Sidebar
 * Persistent left-hand sidebar for administrative routes.
 *
 * CHANGES:
 * - Replaced plain <a> tags with React Router NavLink so active state
 *   is driven by the router (not window.location) and navigation is SPA
 *   (no full page reloads).
 * - Removed window.location.pathname hack.
 */

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, BarChart3, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const links = [
  { name: 'Dashboard',  icon: LayoutDashboard, path: '/admin' },
  { name: 'Courses',    icon: BookOpen,         path: '/admin/courses' },
  { name: 'Students',   icon: Users,            path: '/admin/students' },
  { name: 'Analytics',  icon: BarChart3,        path: '/admin/analytics' },
  { name: 'Settings',   icon: Settings,         path: '/admin/settings' },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white hidden md:block h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            // NavLink receives isActive from React Router — no manual string compare needed
            end={link.path === '/admin'} // 'end' prevents /admin matching /admin/courses
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className={cn('h-5 w-5', isActive ? 'text-primary-600' : 'text-gray-400')} />
                {link.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
