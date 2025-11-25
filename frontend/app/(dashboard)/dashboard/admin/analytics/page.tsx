'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Users, BookOpen, Award, Clock } from 'lucide-react';
import { getDashboardStats } from '@/lib/api/analytics';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-text-muted">Loading analytics...</div>
      </div>
    );
  }

  const completionRates = stats?.completion_rates || [];
  const popularCourses = stats?.popular_courses || [];
  const eventStats = stats?.event_stats || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Analytics Dashboard</h1>
        <p className="text-text-muted">Comprehensive insights into Caava Knowledge Center</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold text-text-primary">{stats?.stats?.total_users || 0}</p>
            </div>
            <Users size={32} className="text-primary" />
          </div>
        </div>
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-text-primary">{stats?.stats?.total_courses || 0}</p>
            </div>
            <BookOpen size={32} className="text-green-500" />
          </div>
        </div>
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Total Enrollments</p>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.stats?.total_enrollments || 0}
              </p>
            </div>
            <Award size={32} className="text-purple-500" />
          </div>
        </div>
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Active Users (30d)</p>
              <p className="text-3xl font-bold text-text-primary">
                {stats?.stats?.active_users_30d || 0}
              </p>
            </div>
            <TrendingUp size={32} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Course Completion Rates */}
      {completionRates.length > 0 && (
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <h2 className="text-2xl font-semibold text-primary mb-4">Course Completion Rates</h2>
          <div className="space-y-4">
            {completionRates.slice(0, 10).map((course: any) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-text-primary font-medium">{course.title}</span>
                  <span className="text-text-muted text-sm">
                    {course.completed || 0} / {course.total_enrollments || 0} completed
                  </span>
                </div>
                <div className="w-full bg-secondary/20 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${course.completion_rate || 0}%`,
                    }}
                  />
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {parseFloat(course.completion_rate || 0).toFixed(1)}% completion rate
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Courses */}
      {popularCourses.length > 0 && (
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <h2 className="text-2xl font-semibold text-primary mb-4">Most Popular Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCourses.slice(0, 6).map((course: any) => (
              <div
                key={course.id}
                className="p-4 bg-background border border-secondary/20 rounded-lg"
              >
                <h3 className="font-semibold text-text-primary mb-2">{course.title}</h3>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>{course.enrollment_count || 0} enrollments</span>
                  {course.average_rating && (
                    <span>⭐ {parseFloat(course.average_rating).toFixed(1)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Statistics */}
      {eventStats.length > 0 && (
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <h2 className="text-2xl font-semibold text-primary mb-4">Event Statistics (30 days)</h2>
          <div className="space-y-3">
            {eventStats.map((event: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-text-primary">{event.event_type}</span>
                <span className="text-text-muted">{event.count} events</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

