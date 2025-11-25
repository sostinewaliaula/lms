'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [search]);

  const fetchCourses = async () => {
    try {
      const data = await coursesApi.getAll({ search, limit: 20 });
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-primary">Courses</h1>
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-background-dark border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="text-text-muted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/courses/${course.id}`}
              className="bg-background-card rounded-lg p-6 border border-secondary/30 hover:border-primary transition-colors"
            >
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {course.title}
              </h3>
              <p className="text-text-muted text-sm mb-4 line-clamp-2">
                {course.short_description || course.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-primary">
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
  );
}


