import { useEffect, useMemo, useState } from 'react';
import { Route, Layers3, BookOpen, Clock, Trash2, Edit, Plus, Search } from 'lucide-react';
import { getLearningPaths, createLearningPath, updateLearningPath, deleteLearningPath, LearningPath } from '@/lib/api/learningPaths';
import { getCourses } from '@/lib/api/courses';
import toast from '@/lib/toast';

interface CourseSummary {
  id: string;
  title: string;
  duration_hours?: number;
}

export default function AdminLearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<LearningPath | null>(null);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: '',
    estimated_duration_hours: '',
    is_published: true,
  });
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (title: string, message: string) => {
    toastSuccess(title, {
      subtitle: message,
      duration: 3500,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pathsData, coursesData] = await Promise.all([getLearningPaths(), getCourses({ limit: 200, offset: 0 })]);
      setPaths(Array.isArray(pathsData) ? pathsData : []);
      const list = Array.isArray(coursesData.courses) ? coursesData.courses : [];
      setCourses(
        list.map((c: any) => ({
          id: c.id,
          title: c.title,
          duration_hours: c.duration_hours,
        }))
      );
    } catch (error) {
      console.error('Error loading learning paths:', error);
      toast.error('Unable to load learning paths.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPaths = useMemo(() => {
    if (!search.trim()) return paths;
    const q = search.toLowerCase();
    return paths.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.difficulty_level?.toLowerCase().includes(q)
    );
  }, [paths, search]);

  const summary = useMemo(() => {
    const total = paths.length;
    const published = paths.filter((p) => p.is_published).length;
    const totalCourses = paths.reduce((sum, p) => sum + (p.courses_count || 0), 0);
    return { total, published, totalCourses };
  }, [paths]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        difficulty_level: formData.difficulty_level || undefined,
        estimated_duration_hours: formData.estimated_duration_hours
          ? Number(formData.estimated_duration_hours)
          : undefined,
        is_published: formData.is_published,
        course_ids: selectedCourseIds,
      };
      if (editingPath) {
        await updateLearningPath(editingPath.id, payload);
        showToast('Path updated', 'Learning path updated successfully.');
      } else {
        await createLearningPath(payload);
        showToast('Path created', 'Learning path created successfully.');
      }
      setShowModal(false);
      setEditingPath(null);
      setFormData({
        title: '',
        description: '',
        difficulty_level: '',
        estimated_duration_hours: '',
        is_published: true,
      });
      setSelectedCourseIds([]);
      fetchData();
    } catch (error) {
      console.error('Error saving learning path:', error);
      toast.error('Failed to save learning path.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (path: LearningPath) => {
    setEditingPath(path);
    setFormData({
      title: path.title,
      description: path.description || '',
      difficulty_level: path.difficulty_level || '',
      estimated_duration_hours: path.estimated_duration_hours?.toString() || '',
      is_published: path.is_published,
    });
    // We don't have per-path courses list yet from API; for now start empty and let admin reselect.
    setSelectedCourseIds([]);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLearningPath(id);
      setPaths((prev) => prev.filter((p) => p.id !== id));
      showToast('Path removed', 'Learning path deleted.');
    } catch (error) {
      console.error('Error deleting learning path:', error);
      toast.error('Failed to delete learning path.');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-emerald-500/15 via-background-card to-background shadow-lg shadow-emerald-500/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-600 font-semibold">Pathways</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Learning paths</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Stitch together multiple courses into guided journeys for new hires, managers, or specialist tracks.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Active paths</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
            <Route size={20} className="text-emerald-500" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Courses linked</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.totalCourses}</p>
            </div>
            <BookOpen size={20} className="text-primary" />
          </div>
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search learning paths..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPath(null);
              setFormData({
                title: '',
                description: '',
                difficulty_level: '',
                estimated_duration_hours: '',
                is_published: true,
              });
              setSelectedCourseIds([]);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add path
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading learning paths...</div>
      ) : filteredPaths.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No learning paths yet</p>
          <p className="text-sm text-text-muted">Create a path to group courses into a guided journey.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPaths.map((path) => (
            <div key={path.id} className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Layers3 size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">{path.title}</h2>
                    <p className="text-xs text-text-muted">
                      {path.courses_count || 0} courses · {path.total_hours || 0}h total
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleEdit(path)}
                    className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(path)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {path.description && <p className="text-sm text-text-muted mt-4">{path.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-3xl border border-secondary/30 shadow-2xl shadow-primary/20 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-text-primary">
                  {editingPath ? 'Edit learning path' : 'Create learning path'}
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Choose courses and describe who this journey is for.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                      placeholder="e.g., New Manager Onboarding"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty_level}
                      onChange={(e) => setFormData((prev) => ({ ...prev, difficulty_level: e.target.value }))}
                      className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="">Not set</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                      Estimated hours
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.estimated_duration_hours}
                      onChange={(e) => setFormData((prev) => ({ ...prev, estimated_duration_hours: e.target.value }))}
                      className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full h-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    rows={6}
                    placeholder="Outline what this path covers and who should take it."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Courses in this path
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-secondary/30 rounded-2xl p-3">
                  {courses.map((course) => {
                    const active = selectedCourseIds.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() =>
                          setSelectedCourseIds((prev) =>
                            prev.includes(course.id) ? prev.filter((id) => id !== course.id) : [...prev, course.id]
                          )
                        }
                        className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs text-left transition ${
                          active
                            ? 'bg-primary/10 border-primary text-text-primary'
                            : 'bg-background border-secondary/30 text-text-muted hover:border-primary/50'
                        }`}
                      >
                        <span className="truncate mr-2">{course.title}</span>
                        {course.duration_hours && (
                          <span className="flex items-center gap-1 text-[10px] text-text-muted">
                            <Clock size={10} /> {course.duration_hours}h
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {courses.length === 0 && (
                    <p className="text-xs text-text-muted col-span-2">
                      No courses available yet. Create courses first to add them to a path.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPath(null);
                    setSelectedCourseIds([]);
                  }}
                  className="rounded-xl border border-secondary/30 px-4 py-2.5 text-sm font-medium text-text-primary hover:border-primary/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingPath ? 'Update path' : 'Create path'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-primary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete learning path?</h3>
            <p className="text-sm text-text-muted mt-2">
              This removes <span className="font-semibold">{confirmDelete.title}</span>. Courses remain available, but
              the path will disappear from dashboards.
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


