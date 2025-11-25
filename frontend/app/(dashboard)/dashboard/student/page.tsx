'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    inProgress: 0,
    certificates: 0,
  });
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myCoursesData, allCoursesData] = await Promise.all([
          coursesApi.getMyCourses(),
          coursesApi.getAll({ limit: 6 }),
        ]);

        const enrolled = myCoursesData.courses || [];
        setMyCourses(enrolled);
        setRecentCourses(allCoursesData.courses || []);

        setStats({
          enrolledCourses: enrolled.length,
          completedCourses: enrolled.filter((c: any) => c.completed_at).length,
          inProgress: enrolled.filter((c: any) => c.completed_at === null && c.progress_percentage > 0).length,
          certificates: enrolled.filter((c: any) => c.completed_at).length, // TODO: Get from certificates API
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: stats.enrolledCourses,
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-secondary',
    },
    {
      title: 'Completed',
      value: stats.completedCourses,
      icon: Award,
      color: 'text-primary',
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: TrendingUp,
      color: 'text-secondary',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">My Learning Dashboard</h1>
        <p className="text-text-muted">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-background-card rounded-lg p-6 border border-secondary/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-muted text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <Icon size={32} className={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      {myCourses.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-primary">My Courses</h2>
            <Link
              href="/dashboard/my-courses"
              className="text-primary hover:underline text-sm"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.slice(0, 6).map((course: any) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}/learn`}
                className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors"
              >
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {course.title}
                </h3>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">Progress</span>
                    <span className="text-primary text-sm">
                      {Math.round(course.progress_percentage || 0)}%
                    </span>
                  </div>
                  <div className="w-full bg-background-dark rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${course.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>
                {course.completed_at ? (
                  <span className="text-primary text-sm">✓ Completed</span>
                ) : (
                  <span className="text-text-muted text-sm">Continue Learning →</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-primary">Explore Courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-primary hover:underline text-sm"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="text-text-muted">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course: any) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors"
              >
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {course.title}
                </h3>
                <p className="text-text-muted text-sm line-clamp-2 mb-4">
                  {course.short_description || course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary text-sm">
                    {course.is_free ? 'Free' : `$${course.price}`}
                  </span>
                  <span className="text-text-muted text-sm">
                    {course.enrolled_count} students
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


