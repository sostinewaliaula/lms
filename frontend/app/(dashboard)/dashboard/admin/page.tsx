'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  FileText,
  MessageSquare,
  BarChart3,
  Building2,
  UserCheck,
  Award,
} from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { getDashboardStats } from '@/lib/api/analytics';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          authApi.getProfile(),
          getDashboardStats(),
        ]);
        setUser(profileData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.stats?.total_users || 0,
      icon: Users,
      color: 'text-primary',
      link: '/dashboard/admin/users',
    },
    {
      title: 'Total Courses',
      value: stats?.stats?.total_courses || 0,
      icon: BookOpen,
      color: 'text-green-500',
      link: '/dashboard/admin/courses',
    },
    {
      title: 'Total Enrollments',
      value: stats?.stats?.total_enrollments || 0,
      icon: GraduationCap,
      color: 'text-purple-500',
      link: '/dashboard/admin/enrollments',
    },
    {
      title: 'Active Users (30d)',
      value: stats?.stats?.active_users_30d || 0,
      icon: TrendingUp,
      color: 'text-blue-500',
      link: '/dashboard/admin/analytics',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: Users,
      link: '/dashboard/admin/users',
      color: 'bg-primary/10 border-primary/30',
    },
    {
      title: 'Manage Courses',
      description: 'Create and manage courses',
      icon: BookOpen,
      link: '/dashboard/admin/courses',
      color: 'bg-green-500/10 border-green-500/30',
    },
    {
      title: 'Departments',
      description: 'Manage departments',
      icon: Building2,
      link: '/dashboard/admin/departments',
      color: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      title: 'Categories',
      description: 'Manage course categories',
      icon: FileText,
      link: '/dashboard/admin/categories',
      color: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics',
      icon: BarChart3,
      link: '/dashboard/admin/analytics',
      color: 'bg-yellow-500/10 border-yellow-500/30',
    },
    {
      title: 'Certificates',
      description: 'Manage certificates',
      icon: Award,
      link: '/dashboard/admin/certificates',
      color: 'bg-pink-500/10 border-pink-500/30',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-3">Admin Dashboard</h1>
        <p className="text-lg text-text-muted mb-1">Welcome back, {user?.user?.first_name || 'Admin'}!</p>
        <p className="text-base text-text-muted">
          <span className="text-primary font-semibold">Caava</span>{' '}
          <span className="text-secondary font-semibold">Group</span> - Caava Knowledge Center
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.link}
              className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <Icon size={32} className={stat.color} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.link}
                className={`${action.color} rounded-lg p-6 border hover:scale-105 transition-transform`}
              >
                <Icon size={24} className="text-primary mb-3" />
                <h3 className="text-lg font-semibold text-text-primary mb-1">{action.title}</h3>
                <p className="text-sm text-text-muted">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity / Popular Courses */}
      {stats?.popular_courses && stats.popular_courses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-primary">Popular Courses</h2>
            <Link href="/dashboard/admin/courses" className="text-primary hover:underline text-sm">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.popular_courses.slice(0, 6).map((course: any) => (
              <div
                key={course.id}
                className="bg-background-card rounded-lg p-4 border border-secondary/30"
              >
                <h3 className="font-semibold text-text-primary mb-2">{course.title}</h3>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{course.enrollment_count} enrollments</span>
                  {course.average_rating && (
                    <span>⭐ {parseFloat(course.average_rating).toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
