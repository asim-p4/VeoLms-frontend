/**
 * @fileoverview Main Application Footer
 * Contains standard platform links, copyright, and social icons.
 */
import * as React from 'react';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-sm mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-1">
            <a href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600 mb-4">
              <BookOpen className="h-6 w-6" />
              <span>VeoLMS</span>
            </a>
            <p className="text-gray-500 mb-4">
              Open-source learning management system designed to make education accessible to everyone.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="/courses" className="hover:text-primary-600">Browse Courses</a></li>
              <li><a href="#" className="hover:text-primary-600">Pricing</a></li>
              <li><a href="#" className="hover:text-primary-600">Features</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="#" className="hover:text-primary-600">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-500">
              <li><a href="#" className="hover:text-primary-600">Twitter</a></li>
              <li><a href="#" className="hover:text-primary-600">GitHub</a></li>
              <li><a href="#" className="hover:text-primary-600">Discord</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} VeoLMS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
