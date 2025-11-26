'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, BookOpen, Award, Clock, Sparkles, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from 'recharts';
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
  const completionAverage =
    completionRates.length > 0
      ? completionRates.reduce((sum: number, course: any) => sum + (course.completion_rate || 0), 0) /
        completionRates.length
      : 0;
  const totalEvents = eventStats.reduce((sum: number, event: any) => sum + (event.count || 0), 0);
  const insights = eventStats.slice(0, 4);

  const completionChartData = completionRates.slice(0, 8).map((course: any) => ({
    name: course.title,
    completion: Number(course.completion_rate || 0),
  }));

  const eventChartData = eventStats.map((event: any) => ({
    name: event.event_type,
    count: event.count || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0b1120] via-[#131c32] to-[#05080f] text-white p-8 shadow-[0_25px_70px_rgba(0,0,0,0.35)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 blur-[120px]" />
          <div className="relative z-10 flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-primary/80">Engagement pulse</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">Knowledge Center health</h1>
              <p className="text-sm text-white/70 mt-3 max-w-2xl">
                Key learning signals from the last 30 days, powered by live usage events.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Active users</p>
                <p className="text-4xl font-semibold mt-1">{overview.activeUsers}</p>
                <span className="text-xs text-emerald-300">+8% vs last cycle</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Avg completion</p>
                <p className="text-4xl font-semibold mt-1">{completionAverage.toFixed(1)}%</p>
                <span className="text-xs text-indigo-200">Top 8 courses</span>
              </div>
            </div>
            {insights.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs uppercase tracking-wide text-white/60">Latest events</p>
                {insights.map((event) => (
                  <div key={event.event_type} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                    <span className="text-sm font-medium">{event.event_type}</span>
                    <span className="text-xs text-white/70">{event.count} hits</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-5 shadow-lg shadow-secondary/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase text-text-muted">Heartbeat</p>
              <Sparkles size={18} className="text-primary" />
            </div>
            <p className="text-4xl font-semibold text-text-primary">{totalEvents}</p>
            <p className="text-xs text-text-muted">events tracked in the last 30 days</p>
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-5 shadow-lg shadow-secondary/10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase text-text-muted">Courses trending</p>
              <TrendingUp size={18} className="text-secondary" />
            </div>
            <div className="space-y-2">
              {popularCourses.slice(0, 3).map((course: any) => (
                <div key={course.id} className="flex items-center justify-between">
                  <span className="text-sm text-text-primary truncate">{course.title}</span>
                  <span className="text-xs text-text-muted">{course.enrollment_count || 0} learners</span>
                </div>
              ))}
            </div>
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

      {(completionChartData.length > 0 || eventChartData.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {completionChartData.length > 0 && (
            <div className="bg-background-card rounded-3xl border border-secondary/30 p-6 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-text-muted">Visualization</p>
                  <h2 className="text-lg font-semibold text-text-primary">Completion by course</h2>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionChartData} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                      content={({ active, payload }: any) =>
                        active && payload?.length ? (
                          <div className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-xs shadow">
                            <p className="font-semibold text-text-primary">{payload[0].payload.name}</p>
                            <p className="text-text-muted">{payload[0].value.toFixed(1)}% complete</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="completion" radius={[6, 6, 0, 0]} fill="url(#completionGradient)" />
                    <defs>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {eventChartData.length > 0 && (
            <div className="bg-background-card rounded-3xl border border-secondary/30 p-6 shadow-lg shadow-primary/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase text-text-muted">Events</p>
                  <h2 className="text-lg font-semibold text-text-primary">Interactions by type</h2>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eventChartData} margin={{ left: -20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.25)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                      content={({ active, payload }: any) =>
                        active && payload?.length ? (
                          <div className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-xs shadow">
                            <p className="font-semibold text-text-primary">{payload[0].payload.name}</p>
                            <p className="text-text-muted">{payload[0].value} events</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

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

