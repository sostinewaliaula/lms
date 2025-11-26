'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, BookOpen, Award, Clock, Sparkles, Activity } from 'lucide-react';
import { getDashboardStats } from '@/lib/api/analytics';
import toast from 'react-hot-toast';

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
      toast.error('Unable to load analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  const overview = useMemo(
    () => ({
      users: stats?.stats?.total_users || 0,
      courses: stats?.stats?.total_courses || 0,
      enrollments: stats?.stats?.total_enrollments || 0,
      activeUsers: stats?.stats?.active_users_30d || 0,
    }),
    [stats]
  );

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
      <section className="bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 border border-primary/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-lg shadow-primary/10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">Insights</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mt-2">Analytics Dashboard</h1>
          <p className="text-text-muted mt-3 max-w-2xl">
            Track adoption, completion, and engagement across every program. These numbers update live from the learning
            activity API.
          </p>
        </div>
        <div className="rounded-2xl border border-secondary/40 bg-background-card/80 px-5 py-3 flex items-center gap-3 shadow-lg shadow-secondary/10">
          <Activity size={20} className="text-primary" />
          <div>
            <p className="text-xs uppercase text-text-muted">Active users (30d)</p>
            <p className="text-2xl font-semibold text-text-primary">{overview.activeUsers}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total users', value: overview.users, icon: Users, accent: 'text-primary bg-primary/10' },
          { label: 'Courses', value: overview.courses, icon: BookOpen, accent: 'text-emerald-500 bg-emerald-500/10' },
          { label: 'Enrollments', value: overview.enrollments, icon: Award, accent: 'text-purple-500 bg-purple-500/10' },
          { label: 'Live sessions', value: stats?.stats?.live_sessions ?? 0, icon: Clock, accent: 'text-amber-500 bg-amber-500/10' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-secondary/20 bg-background-card p-4 shadow-lg shadow-secondary/10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</p>
              <span className={`rounded-full p-2 ${card.accent}`}>
                <card.icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      {completionRates.length > 0 && (
        <div className="bg-background-card rounded-3xl border border-secondary/30 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-text-muted">Progress</p>
              <h2 className="text-2xl font-semibold text-text-primary">Course completion rates</h2>
            </div>
            <span className="text-sm text-text-muted">Top {Math.min(completionRates.length, 8)} courses</span>
          </div>
          <div className="space-y-5">
            {completionRates.slice(0, 8).map((course: any) => (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">{course.title}</span>
                  <span className="text-xs text-text-muted">
                    {course.completed || 0}/{course.total_enrollments || 0} ·{' '}
                    {parseFloat(course.completion_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary/20">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${course.completion_rate || 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {popularCourses.length > 0 && (
        <div className="bg-background-card rounded-3xl border border-secondary/30 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-text-muted">Discovery</p>
              <h2 className="text-2xl font-semibold text-text-primary">Most popular courses</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {popularCourses.slice(0, 6).map((course: any) => (
              <div key={course.id} className="rounded-2xl border border-secondary/20 bg-background p-4 shadow hover:border-primary transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text-primary">{course.title}</h3>
                  {course.average_rating && <span className="text-xs text-amber-500">⭐ {parseFloat(course.average_rating).toFixed(1)}</span>}
                </div>
                <p className="text-xs text-text-muted">{course.enrollment_count || 0} enrollments</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {eventStats.length > 0 && (
        <div className="bg-background-card rounded-3xl border border-secondary/30 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-text-muted">Activity stream</p>
              <h2 className="text-2xl font-semibold text-text-primary">Events (last 30 days)</h2>
            </div>
          </div>
          <div className="space-y-3">
            {eventStats.map((event: any, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-secondary/20 px-4 py-3">
                <span className="text-sm font-medium text-text-primary">{event.event_type}</span>
                <span className="text-xs text-text-muted">{event.count} events</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

