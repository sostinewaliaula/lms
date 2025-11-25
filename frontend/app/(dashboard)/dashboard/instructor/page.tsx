'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Users, Award, Plus } from 'lucide-react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';

export default function InstructorDashboard() {
  const [stats, setStats] = useState({
    myCourses: 0,
    totalStudents: 0,
    publishedCourses: 0,
    drafts: 0,
  });
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesData = await coursesApi.getMyCourses();
        const courses = coursesData.courses || [];
        
        setMyCourses(courses.slice(0, 6));
        setStats({
          myCourses: courses.length,
          totalStudents: courses.reduce((sum: number, c: any) => sum + (c.enrolled_count || 0), 0),
          publishedCourses: courses.filter((c: any) => c.is_published).length,
          drafts: courses.filter((c: any) => !c.is_published).length,
        });
      } catch (error) {
        console.error('Error fetching instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'My Courses',
      value: stats.myCourses,
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-secondary',
    },
    {
      title: 'Published',
      value: stats.publishedCourses,
      icon: Award,
      color: 'text-primary',
    },
    {
      title: 'Drafts',
      value: stats.drafts,
      icon: BookOpen,
      color: 'text-secondary',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Instructor Dashboard</h1>
        <p className="text-text-muted">Manage your courses and track student progress</p>
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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-primary">My Courses</h2>
        <Link
          href="/dashboard/courses/create"
          className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Create New Course
        </Link>
      </div>

      {loading ? (
        <div className="text-text-muted">Loading...</div>
      ) : myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCourses.map((course: any) => (
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
                  {course.enrolled_count || 0} students
                </span>
                <span className={`text-sm ${course.is_published ? 'text-primary' : 'text-text-muted'}`}>
                  {course.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-background-card rounded-lg p-12 border border-secondary/30 text-center">
          <BookOpen size={48} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted mb-4">You haven't created any courses yet</p>
          <Link
            href="/dashboard/courses/create"
            className="inline-block bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create Your First Course
          </Link>
        </div>
      )}
    </div>
  );
}


