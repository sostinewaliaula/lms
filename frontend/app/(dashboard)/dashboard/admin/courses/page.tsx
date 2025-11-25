'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, Edit, Trash2, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { getCourses } from '@/lib/api/courses';
import { getDepartments } from '@/lib/api/departments';
import { getCategories } from '@/lib/api/categories';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    department_id: '',
    category_id: '',
    is_published: '',
    search: '',
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchCategories();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses({
        ...filters,
        department_id: filters.department_id || undefined,
        category_id: filters.category_id || undefined,
        is_published: filters.is_published ? filters.is_published === 'true' : undefined,
        search: filters.search || undefined,
      });
      setCourses(response.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Course Management</h1>
          <p className="text-text-muted">Manage all courses in the system</p>
        </div>
        <Link
          href="/dashboard/admin/courses/create"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Course
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-background-card rounded-lg p-4 border border-secondary/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
          />
          <select
            value={filters.department_id}
            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
            className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filters.category_id}
            onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
            className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={filters.is_published}
            onChange={(e) => setFilters({ ...filters, is_published: e.target.value })}
            className="px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 text-text-muted">No courses found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-background-card rounded-lg border border-secondary/30 overflow-hidden hover:border-primary transition-colors"
            >
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
                    {course.title}
                  </h3>
                </div>
                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                  {course.short_description || course.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  {course.department && (
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                      {course.department.name}
                    </span>
                  )}
                  {course.category && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                      {course.category.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-muted">
                    <div>{course.enrolled_count} enrolled</div>
                    {course.rating > 0 && <div>⭐ {course.rating.toFixed(1)}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="text-primary hover:text-primary/80"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/admin/courses/${course.id}/edit`}
                      className="text-primary hover:text-primary/80"
                    >
                      <Edit size={18} />
                    </Link>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-secondary/20">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      course.is_published
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

