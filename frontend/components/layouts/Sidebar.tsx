'use client';

import { useState, useEffect } from 'react';
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
  Building2,
  Tag,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import ThemeToggle from '@/components/ThemeToggle';

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
      { name: 'Manage Courses', href: '/dashboard/admin/courses', icon: BookOpen },
      { name: 'Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'Departments', href: '/dashboard/admin/departments', icon: Building2 },
      { name: 'Categories', href: '/dashboard/admin/categories', icon: Tag },
      { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
      { name: 'Forums', href: '/dashboard/forums', icon: MessageSquare },
      { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ];
  }

  return baseItems;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await authApi.getProfile();
        setUserRole(profile.user?.role || null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    fetchUser();
  }, []);

  const menuItems = getMenuItems(userRole || undefined);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/login';
    }
  };

  return (
    <div className="h-full w-64 bg-background-card border-r border-secondary/30 flex flex-col">
      <div className="px-4 border-b border-secondary/30 pb-3">
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 -my-4 flex items-center justify-center">
            {!logoError ? (
              <img 
                src="/assets/logo.png" 
                alt="Caava Group" 
                className="w-40 h-40 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-center">
                <h1 className="text-3xl font-bold leading-tight">
                  <span className="text-primary">Caava</span>{' '}
                  <span className="text-secondary">Group</span>
                </h1>
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-text-primary text-center whitespace-nowrap tracking-wider knowledge-center-text -mt-3 mb-1">
            Caava Knowledge Center
          </p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-4 border-primary'
                  : 'text-text-muted hover:bg-secondary/10 hover:text-text-primary'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-muted hover:bg-secondary/10 hover:text-text-primary transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
