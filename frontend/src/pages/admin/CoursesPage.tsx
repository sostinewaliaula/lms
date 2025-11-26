import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Clock,
  Users,
  BookOpen,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getCourses, Course, deleteCourse } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';

type ViewMode = 'grid' | 'list';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 12;

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    department_id: '',
    is_published: '',
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCourse(id);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      department_id: '',
      is_published: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const totalPages = Math.ceil(total / coursesPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Course Management</h1>
          <p className="text-text-muted">Manage all courses in Caava Knowledge Center</p>
        </div>
        <Link to="/dashboard/admin/courses/create"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Create Course
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-background-card rounded-lg p-4 border border-secondary/30">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search courses by title, description, or instructor..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background border-secondary/30 text-text-primary hover:bg-secondary/10'
            }`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {Object.values(filters).filter((v) => v !== '').length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/30 text-text-muted hover:bg-secondary/10 transition-colors"
            >
              <X size={18} />
              Clear
            </button>
          )}

          <div className="flex items-center gap-2 bg-background border border-secondary/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-secondary/10'
              }`}
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-secondary/10'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-secondary/20 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => {
                  setFilters({ ...filters, category_id: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
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
              <label className="block text-sm font-medium text-text-primary mb-2">Department</label>
              <select
                value={filters.department_id}
                onChange={(e) => {
                  setFilters({ ...filters, department_id: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
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
              <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
              <select
                value={filters.is_published}
                onChange={(e) => {
                  setFilters({ ...filters, is_published: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">All Status</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          {loading ? (
            'Loading...'
          ) : (
            <>
              Showing <span className="font-semibold text-text-primary">{courses.length}</span> of{' '}
              <span className="font-semibold text-text-primary">{total}</span> courses
            </>
          )}
        </p>
      </div>

      {/* Courses Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-background-card rounded-lg border border-secondary/30 animate-pulse">
              <div className="h-48 bg-secondary/20 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                <div className="h-3 bg-secondary/20 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-background-card rounded-lg border border-secondary/30">
          <BookOpen size={64} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No courses found</h3>
          <p className="text-text-muted mb-6">Get started by creating your first course</p>
          <Link to="/dashboard/admin/courses/create"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold"
          >
            <Plus size={20} />
            Create Course
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-background-card rounded-lg border border-secondary/30 overflow-hidden hover:border-primary transition-all group"
            >
              <div className="relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <BookOpen size={48} className="text-text-muted" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  {course.is_published ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle size={12} />
                      Published
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <XCircle size={12} />
                      Draft
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Free
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  {course.instructor && (
                    <p className="text-sm text-text-muted">
                      {course.instructor.first_name} {course.instructor.last_name}
                    </p>
                  )}
                </div>

                <p className="text-sm text-text-muted line-clamp-2">
                  {course.short_description || course.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-text-muted pt-2 border-t border-secondary/20">
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{course.enrolled_count}</span>
                  </div>
                  {course.duration_hours && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.duration_hours}h</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-2">
                  {course.category && (
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded">
                      {course.category.name}
                    </span>
                  )}
                  {course.department && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded">
                      {course.department.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-secondary/20">
                  <Link to={`/dashboard/courses/${course.id}`}
                    className="flex-1 px-3 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye size={16} />
                    View
                  </Link>
                  <Link to={`/dashboard/admin/courses/${course.id}/edit`}
                    className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-background-card rounded-lg border border-secondary/30 p-6 hover:border-primary transition-all"
            >
              <div className="flex gap-6">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-64 h-40 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-64 h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={48} className="text-text-muted" />
                  </div>
                )}

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-text-primary">{course.title}</h3>
                        {course.is_published ? (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                            <CheckCircle size={12} />
                            Published
                          </span>
                        ) : (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                            <XCircle size={12} />
                            Draft
                          </span>
                        )}
                      </div>
                      {course.instructor && (
                        <p className="text-sm text-text-muted mb-2">
                          By {course.instructor.first_name} {course.instructor.last_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary mb-1">
                        Free
                      </div>
                    </div>
                  </div>

                  <p className="text-text-muted line-clamp-2">
                    {course.short_description || course.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-text-muted">
                    {course.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{course.rating.toFixed(1)}</span>
                        <span>({course.total_ratings})</span>
                      </div>
                    )}
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.duration_hours} hours</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{course.enrolled_count} students</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {course.category && (
                      <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full">
                        {course.category.name}
                      </span>
                    )}
                    {course.department && (
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full">
                        {course.department.name}
                      </span>
                    )}
                    {course.difficulty_level && (
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full">
                        {course.difficulty_level}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-secondary/20">
                    <Link to={`/dashboard/courses/${course.id}`}
                      className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Eye size={16} />
                      View Course
                    </Link>
                    <Link to={`/dashboard/admin/courses/${course.id}/edit`}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/10 transition-colors"
          >
            <ChevronLeft size={20} />
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
                      ? 'bg-primary text-white border-primary'
                      : 'border-secondary/30 hover:bg-secondary/10'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-2 text-text-muted">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/10 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
