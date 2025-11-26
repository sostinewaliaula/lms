import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid3x3,
  List,
  Star,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getCourses, Course } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'popular' | 'rating';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const coursesPerPage = 12;

  const [filters, setFilters] = useState({
    search: '',
    category_id: '',
    department_id: '',
    difficulty_level: '',
  });

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const depts = await getDepartments();
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: coursesPerPage,
        offset: (currentPage - 1) * coursesPerPage,
        is_published: true,
        visibility: 'public',
      };

      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.department_id) params.department_id = filters.department_id;
      if (filters.difficulty_level) {
        // Note: This would need backend support
      }

      const response = await getCourses(params);
      let sortedCourses = [...response.courses];

      // Client-side sorting
      switch (sortBy) {
        case 'popular':
          sortedCourses.sort((a, b) => b.enrolled_count - a.enrolled_count);
          break;
        case 'rating':
          sortedCourses.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          sortedCourses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      // Filter by difficulty
      if (filters.difficulty_level) {
        sortedCourses = sortedCourses.filter((c) => c.difficulty_level === filters.difficulty_level);
      }

      setCourses(sortedCourses);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, currentPage, coursesPerPage]);

  useEffect(() => {
    fetchCategories();
    fetchDepartments();
  }, [fetchCategories, fetchDepartments]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const clearFilters = () => {
    setFilters({
      search: '',
      category_id: '',
      department_id: '',
      difficulty_level: '',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const getDifficultyBadgeColor = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalPages = Math.ceil(total / coursesPerPage);

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-lg p-8 border border-secondary/30">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Explore Our Courses
          </h1>
          <p className="text-lg text-text-muted mb-6">
            Discover thousands of courses to enhance your skills and advance your career
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full pl-12 pr-4 py-4 bg-background-card border border-secondary/30 rounded-lg text-text-primary text-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-background-card border-secondary/30 text-text-primary hover:bg-secondary/10'
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
              Clear All
            </button>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-background-card border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-background-card border border-secondary/30 rounded-lg p-1">
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
        <div className="bg-background-card rounded-lg p-6 border border-secondary/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-text-primary mb-2">Difficulty</label>
              <select
                value={filters.difficulty_level}
                onChange={(e) => {
                  setFilters({ ...filters, difficulty_level: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

          </div>
        </div>
      )}

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
                <div className="h-3 bg-secondary/20 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-background-card rounded-lg border border-secondary/30">
          <BookOpen size={64} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No courses found</h3>
          <p className="text-text-muted mb-4">Try adjusting your filters or search terms</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/dashboard/courses/${course.id}`}
              className="bg-background-card rounded-lg border border-secondary/30 overflow-hidden hover:border-primary transition-all hover:shadow-lg group"
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
                {course.is_free && (
                  <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Free
                  </div>
                )}
                {course.difficulty_level && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyBadgeColor(course.difficulty_level)}`}>
                    {course.difficulty_level}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 group-hover:text-primary transition-colors">
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

                <div className="flex items-center gap-4 text-sm text-text-muted">
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>{course.rating.toFixed(1)}</span>
                      <span className="text-text-muted">({course.total_ratings})</span>
                    </div>
                  )}
                  {course.duration_hours && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.duration_hours}h</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-secondary/20">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Users size={16} />
                    <span>{course.enrolled_count} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-primary">
                    {course.is_free ? 'Free' : `$${course.price}`}
                  </span>
                  <span className="text-sm text-text-muted">View Course →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/dashboard/courses/${course.id}`}
              className="bg-background-card rounded-lg border border-secondary/30 p-6 hover:border-primary transition-all hover:shadow-lg group flex gap-6"
            >
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
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {course.is_free && (
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  {course.instructor && (
                    <p className="text-sm text-text-muted mb-2">
                      By {course.instructor.first_name} {course.instructor.last_name}
                    </p>
                  )}
                </div>

                <p className="text-text-muted line-clamp-2">
                  {course.short_description || course.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-text-muted">
                  {course.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold">{course.rating.toFixed(1)}</span>
                      <span>({course.total_ratings} reviews)</span>
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
                    <span className={`px-3 py-1 text-sm rounded-full ${getDifficultyBadgeColor(course.difficulty_level)}`}>
                      {course.difficulty_level}
                    </span>
                  )}
                </div>
              </div>
            </Link>
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
