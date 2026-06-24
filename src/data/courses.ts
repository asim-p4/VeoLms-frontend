/**
 * @fileoverview Mock course catalog.
 * Represents the database of all courses, sections, and lessons.
 * 
 * DESIGN DECISION: We use a record object mapped by ID for O(1) lookups
 * when fetching by ID, simulating a document store like MongoDB.
 */
import { Course } from '../types';

export const courses: Record<string, Course> = {
  'react-masterclass': {
    id: 'react-masterclass',
    title: 'React 18 Masterclass: Zero to Hero',
    description: 'Master React with hooks, context, and modern patterns. Build real-world applications.',
    longDescription: 'This comprehensive course will take you from absolute beginner to advanced React developer. We cover everything from components and state to Redux, custom hooks, and performance optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/embed/bMknfKXIFA8',
    price: 49900, // Stored in paise for precision (₹499.00)
    discountPrice: 39900,
    instructor: {
      name: 'Hitesh Choudhary',
      avatar: 'https://i.pravatar.cc/150?u=hitesh',
      bio: 'Senior Developer & Educator. Passionate about teaching modern web technologies.',
      studentsCount: 50000,
      coursesCount: 12
    },
    category: 'Frontend',
    level: 'Beginner',
    duration: 720, // 12 hours
    studentsCount: 15432,
    rating: 4.8,
    reviewsCount: 2456,
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    updatedAt: '2024-06-01T00:00:00Z',
    isPublished: true,
    sections: [
      {
        id: 'sec-1',
        title: 'React Fundamentals',
        order: 1,
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Introduction to React',
            duration: 15,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
            isPreview: true,
            order: 1,
            description: 'Understanding what React is and why we use it.'
          },
          {
            id: 'lesson-1-2',
            title: 'Your First Component',
            duration: 20,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isPreview: true,
            order: 2
          }
        ]
      },
      {
        id: 'sec-2',
        title: 'State and Props',
        order: 2,
        lessons: [
          {
            id: 'lesson-2-1',
            title: 'Understanding useState',
            duration: 25,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isPreview: false,
            order: 1
          }
        ]
      }
    ]
  },
  'nodejs-backend': {
    id: 'nodejs-backend',
    title: 'Node.js Backend Development',
    description: 'Build scalable APIs with Express, MongoDB, and TypeScript.',
    longDescription: 'Learn backend engineering from scratch. Master databases, authentication, and RESTful APIs.',
    thumbnail: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&auto=format&fit=crop',
    price: 59900,
    instructor: {
      name: 'Sarah Drasner',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      bio: 'Engineering Manager and Open Source Contributor.',
      studentsCount: 30000,
      coursesCount: 8
    },
    category: 'Backend',
    level: 'Intermediate',
    duration: 600,
    studentsCount: 8900,
    rating: 4.7,
    reviewsCount: 1200,
    tags: ['Node.js', 'Express', 'Backend', 'API'],
    updatedAt: '2024-05-15T00:00:00Z',
    isPublished: true,
    sections: [
      {
        id: 'sec-node-1',
        title: 'Getting Started with Node',
        order: 1,
        lessons: [
          {
            id: 'lesson-n-1',
            title: 'What is Node.js?',
            duration: 10,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            isPreview: true,
            order: 1
          }
        ]
      }
    ]
  },
  'js-fundamentals': {
    id: 'js-fundamentals',
    title: 'JavaScript Fundamentals',
    description: 'The complete guide to modern JavaScript (ES6+).',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=1200&auto=format&fit=crop',
    price: 29900,
    instructor: {
      name: 'Kyle Simpson',
      avatar: 'https://i.pravatar.cc/150?u=kyle',
      bio: 'Author of You Don\'t Know JS.',
      studentsCount: 100000,
      coursesCount: 5
    },
    category: 'Frontend',
    level: 'Beginner',
    duration: 900,
    studentsCount: 45000,
    rating: 4.9,
    reviewsCount: 8000,
    tags: ['JavaScript', 'ES6', 'Web Development'],
    updatedAt: '2024-06-10T00:00:00Z',
    isPublished: true,
    sections: [] // Truncated for brevity, would contain 5 sections
  },
  'ts-advanced': {
    id: 'ts-advanced',
    title: 'TypeScript Advanced Patterns',
    description: 'Master generics, utility types, and advanced type inference.',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1200&auto=format&fit=crop',
    price: 45000,
    discountPrice: 35000,
    instructor: {
      name: 'Matt Pocock',
      avatar: 'https://i.pravatar.cc/150?u=matt',
      bio: 'TypeScript Wizard.',
      studentsCount: 20000,
      coursesCount: 3
    },
    category: 'Frontend',
    level: 'Advanced',
    duration: 300,
    studentsCount: 5000,
    rating: 5.0,
    reviewsCount: 800,
    tags: ['TypeScript', 'Advanced'],
    updatedAt: '2024-06-20T00:00:00Z',
    isPublished: true,
    sections: []
  },
  'python-data': {
    id: 'python-data',
    title: 'Python for Data Science',
    description: 'Pandas, NumPy, and Machine Learning basics.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop',
    price: 69900,
    instructor: {
      name: 'Angela Yu',
      avatar: 'https://i.pravatar.cc/150?u=angela',
      bio: 'Lead Instructor at App Brewery.',
      studentsCount: 200000,
      coursesCount: 15
    },
    category: 'Data Science',
    level: 'Beginner',
    duration: 1200,
    studentsCount: 80000,
    rating: 4.8,
    reviewsCount: 15000,
    tags: ['Python', 'Data Science', 'Machine Learning'],
    updatedAt: '2024-01-05T00:00:00Z',
    isPublished: true,
    sections: []
  },
  'devops-docker': {
    id: 'devops-docker',
    title: 'DevOps with Docker & Kubernetes',
    description: 'Containerization and orchestration for modern applications.',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1200&auto=format&fit=crop',
    price: 79900,
    discountPrice: 59900,
    instructor: {
      name: 'Nana Janashia',
      avatar: 'https://i.pravatar.cc/150?u=nana',
      bio: 'DevOps Engineer and Tech YouTuber.',
      studentsCount: 60000,
      coursesCount: 10
    },
    category: 'DevOps',
    level: 'Intermediate',
    duration: 840,
    studentsCount: 25000,
    rating: 4.9,
    reviewsCount: 4000,
    tags: ['Docker', 'Kubernetes', 'DevOps'],
    updatedAt: '2024-04-12T00:00:00Z',
    isPublished: true,
    sections: []
  }
};
