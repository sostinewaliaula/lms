import { useEffect, useMemo, useState } from 'react';
import { Star, MessageSquare, Search, Trash2, Filter, CheckCircle, XCircle, BookOpen, User } from 'lucide-react';
import { getReviews, deleteReview, getReviewStats, Review, ReviewStats } from '@/lib/api/reviews';
import { getCourses, Course } from '@/lib/api/courses';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<Review | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    course_id: '',
    rating: '',
    is_verified_purchase: '',
  });

  useEffect(() => {
    fetchData();
    fetchCourses();
  }, [filters]);

  const showToast = (title: string, message: string) => {
    toast.custom(
      <div className="relative min-w-[260px] rounded-3xl border bg-background shadow-lg shadow-black/10 dark:shadow-black/40 px-5 py-4">
        <div className="absolute inset-0 rounded-3xl border border-white/40 dark:border-white/10 pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-primary border-primary/40">
            ✓
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{title}</p>
            <p className="text-xs text-text-muted">{message}</p>
          </div>
          <button onClick={() => toast.dismiss()} className="text-text-muted hover:text-text-primary text-xs font-semibold">
            ✕
          </button>
        </div>
      </div>,
      { duration: 3500 }
    );
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        getReviews({
          course_id: filters.course_id || undefined,
          rating: filters.rating ? parseInt(filters.rating) : undefined,
          is_verified_purchase:
            filters.is_verified_purchase === ''
              ? undefined
              : filters.is_verified_purchase === 'true',
        }),
        getReviewStats(),
      ]);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { courses: coursesData } = await getCourses({ limit: 1000 });
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.user_name?.toLowerCase().includes(q) ||
          r.user_email?.toLowerCase().includes(q) ||
          r.course_title?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [reviews, search]);

  const handleDelete = async (id: string) => {
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      showToast('Review removed', 'Review deleted successfully.');
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
        <span className="ml-2 text-xs font-semibold text-text-primary">{rating}</span>
      </div>
    );
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (rating >= 3) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-yellow-500/15 via-background-card to-background shadow-lg shadow-yellow-500/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-500 font-semibold">Feedback hub</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Course Reviews</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Monitor and manage learner feedback to improve course quality and engagement.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Total reviews</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.total || 0}</p>
            </div>
            <MessageSquare size={20} className="text-primary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Average rating</p>
              <p className="text-2xl font-semibold text-text-primary">
                {stats?.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
              </p>
            </div>
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Verified</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.verified_count || 0}</p>
            </div>
            <CheckCircle size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      {stats && stats.by_rating.length > 0 && (
        <div className="bg-background-card border border-secondary/30 rounded-2xl p-5 shadow-lg shadow-primary/5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Rating Distribution</h3>
          <div className="grid grid-cols-5 gap-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.by_rating.find((r) => r.rating === rating)?.count || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-text-primary">{rating}</span>
                    </div>
                    <span className="text-xs text-text-muted">{count}</span>
                  </div>
                  <div className="h-2 bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by user, course, or comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <span className="text-xs font-semibold text-text-muted uppercase">Filters:</span>
          </div>
          <select
            value={filters.course_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, course_id: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <select
            value={filters.rating}
            onChange={(e) => setFilters((prev) => ({ ...prev, rating: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            value={filters.is_verified_purchase}
            onChange={(e) => setFilters((prev) => ({ ...prev, is_verified_purchase: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Reviews</option>
            <option value="true">Verified Only</option>
            <option value="false">Unverified Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No reviews found</p>
          <p className="text-sm text-text-muted">
            {search || Object.values(filters).some((f) => f) ? 'Try adjusting your filters.' : 'No reviews have been submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <User size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text-primary">{review.user_name || 'Unknown User'}</h3>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle size={10} />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mb-2">{review.user_email}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-text-muted" />
                          <span className="text-sm text-text-primary font-medium">{review.course_title}</span>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${getRatingColor(review.rating)}`}>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <div className="mt-3 p-3 rounded-xl bg-secondary/10 border border-secondary/20">
                          <p className="text-sm text-text-primary leading-relaxed">{review.comment}</p>
                        </div>
                      )}
                      <p className="text-xs text-text-muted mt-3">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(review)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete Review?</h3>
            <p className="text-sm text-text-muted mt-2">
              This will permanently remove the review from{' '}
              <span className="font-semibold">{confirmDelete.user_name}</span> for{' '}
              <span className="font-semibold">{confirmDelete.course_title}</span>. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete.id)}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-500/90"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

