import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  Users,
  Clock,
  Star,
  X,
  CheckCircle2,
  XCircle,
  FileText,
  Video,
  Award,
  GraduationCap,
  Building2,
  Tag,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';
import { getCourses, Course, deleteCourse } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';
import toast, { toastSuccess, toastError } from '@/lib/toast';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 12;

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    department_id: '',
    is_published: '',
    auto_assigned: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [filters, currentPage]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: coursesPerPage,
        offset: (currentPage - 1) * coursesPerPage,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.is_published !== '') {
        params.is_published = filters.is_published === 'true';
      }

      const response = await getCourses(params);
      setCourses(response.courses);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toastError('Failed to load courses', {
        subtitle: 'Please refresh the page and try again.',
      });
    } finally {
      setLoading(false);
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

  const fetchDepartments = async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCourse(deleteConfirm.id);
      toastSuccess('Course deleted', {
        subtitle: 'The course has been removed successfully.',
      });
      fetchCourses();
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toastError('Failed to delete course', {
        subtitle: error?.response?.data?.error || 'Please try again.',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      department_id: '',
      is_published: '',
      auto_assigned: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const stats = {
    total: total,
    published: courses.filter((c) => c.is_published).length,
    draft: courses.filter((c) => !c.is_published).length,
    enrolled: courses.reduce((sum, c) => sum + (c.enrolled_count || 0), 0),
  };

  const totalPages = Math.ceil(total / coursesPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage all courses and learning content
              </p>
            </div>
            <Link
              to="/dashboard/admin/courses/create"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              New Course
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.published}</p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.draft}</p>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <XCircle className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.enrolled}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search courses by title, instructor, or description..."
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={16} className="text-gray-400" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.values(filters).filter((v) => v !== '').length}
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category_id}
                  onChange={(e) => {
                    setFilters({ ...filters, category_id: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department
                </label>
                <select
                  value={filters.department_id}
                  onChange={(e) => {
                    setFilters({ ...filters, department_id: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.is_published}
                  onChange={(e) => {
                    setFilters({ ...filters, is_published: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-Assigned
                </label>
                <select
                  value={filters.auto_assigned}
                  onChange={(e) => {
                    setFilters({ ...filters, auto_assigned: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Courses</option>
                  <option value="true">Auto-Assigned</option>
                  <option value="false">Manual</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-semibold text-gray-900 dark:text-white">{courses.length}</span> of{' '}
                <span className="font-semibold text-gray-900 dark:text-white">{total}</span> courses
              </>
            )}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <BookOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {hasActiveFilters ? 'No courses found' : 'No courses yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Get started by creating your first course'}
            </p>
            {!hasActiveFilters && (
              <Link
                to="/dashboard/admin/courses/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Create Course
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-emerald-600 dark:text-emerald-400" size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {course.is_published ? (
                      <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                        <XCircle size={12} />
                        Draft
                      </span>
                    )}
                  </div>
                  {course.is_free && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                      Free
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {course.title}
                    </h3>
                    {course.instructor && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.instructor.first_name} {course.instructor.last_name}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {course.short_description || course.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {course.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400 fill-amber-400" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{course.enrolled_count || 0}</span>
                    </div>
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{course.duration_hours}h</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {course.category && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg flex items-center gap-1">
                        <Tag size={12} />
                        {course.category.name}
                      </span>
                    )}
                    {course.department && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-lg flex items-center gap-1">
                        <Building2 size={12} />
                        {course.department.name}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`/dashboard/courses/${course.id}`}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                    <Link
                      to={`/dashboard/admin/courses/${course.id}/edit`}
                      className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm({ id: course.id, title: course.title })}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDeleteConfirm(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Course?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  You're about to delete <span className="font-semibold text-red-600 dark:text-red-400">{deleteConfirm.title}</span>. 
                  This will permanently remove the course and all associated content.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
