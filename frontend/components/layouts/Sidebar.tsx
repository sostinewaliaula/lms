'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  MessageSquare,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Users,
  FileText,
} from 'lucide-react';

const getMenuItems = (userRole?: string) => {
  const baseItems = [
    { name: 'Dashboard', href: `/dashboard/${userRole === 'admin' ? 'admin' : userRole === 'instructor' ? 'instructor' : 'student'}`, icon: Home },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
  ];

  if (userRole === 'student') {
    return [
      ...baseItems,
      { name: 'My Courses', href: '/dashboard/my-courses', icon: FileText },
      { name: 'Forums', href: '/dashboard/forums', icon: MessageSquare },
      { name: 'Certificates', href: '/dashboard/certificates', icon: Award },
    ];
  }

  if (userRole === 'instructor') {
    return [
      ...baseItems,
      { name: 'My Courses', href: '/dashboard/my-courses', icon: FileText },
      { name: 'Forums', href: '/dashboard/forums', icon: MessageSquare },
    ];
  }

  if (userRole === 'admin') {
    return [
      ...baseItems,
      { name: 'Users', href: '/dashboard/users', icon: Users },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Forums', href: '/dashboard/forums', icon: MessageSquare },
    ];
  }

  return baseItems;
};

export default function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname();

  const filteredItems = getMenuItems(userRole);

  return (
    <div className="w-64 bg-background-dark min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">LMS</h1>
      </div>

      <nav className="space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          // Check if current path matches or starts with the href
          const isActive = pathname === item.href || 
            (item.href.includes('/dashboard/') && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-secondary text-white'
                  : 'text-text-secondary hover:bg-background-card hover:text-text-primary'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-8 border-t border-secondary/30">
        <button
          onClick={() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-background-card hover:text-text-primary w-full transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

