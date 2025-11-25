'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import apiClient from '@/lib/api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin stats
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          apiClient.get('/users'),
          apiClient.get('/courses'),
          apiClient.get('/analytics/dashboard'),
        ]).catch(() => [{ data: {} }, { data: {} }, { data: {} }]);

        setStats({
          totalUsers: usersRes.data?.total || 0,
          totalCourses: coursesRes.data?.total || 0,
          totalEnrollments: enrollmentsRes.data?.stats?.total_enrollments || 0,
          activeUsers: enrollmentsRes.data?.stats?.active_users_30d || 0,
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-primary',
      link: '/dashboard/users',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-secondary',
      link: '/dashboard/courses',
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: BarChart3,
      color: 'text-primary',
      link: '/dashboard/analytics',
    },
    {
      title: 'Active Users (30d)',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-secondary',
      link: '/dashboard/analytics',
    },
  ];

  const quickActions = [
    { title: 'Manage Users', link: '/dashboard/users', icon: Users },
    { title: 'Manage Courses', link: '/dashboard/courses', icon: BookOpen },
    { title: 'View Analytics', link: '/dashboard/analytics', icon: BarChart3 },
    { title: 'System Settings', link: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-muted">Overview of all system activities and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.link}
                className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors text-center"
              >
                <Icon size={32} className="text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-text-primary">{action.title}</h3>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


