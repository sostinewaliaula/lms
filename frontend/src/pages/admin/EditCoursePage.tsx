import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Trash2, Hash } from 'lucide-react';
import { getCourse, updateCourse, deleteCourse, Course } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';
import { getTags, Tag } from '@/lib/api/tags';
import toast from '@/lib/toast';

export default function EditCoursePage() {
  const navigate = useNavigate();
  const params = useParams();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    category_id: '',
    department_id: '',
    visibility: 'public',
    difficulty_level: '',
    language: 'en',
    duration_hours: '',
    is_published: false,
  });

  useEffect(() => {
    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setDataLoading(true);
      const [course, cats, depts, tagsData] = await Promise.all([
        getCourse(courseId),
        getCategories(),
        getDepartments(),
        getTags(),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);

      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        category_id: course.category_id || '',
        department_id: course.department_id || '',
        visibility: course.visibility || 'public',
        difficulty_level: course.difficulty_level || '',
        language: course.language || 'en',
        duration_hours: course.duration_hours?.toString() || '',
        is_published: course.is_published ?? false,
      });
      if (Array.isArray((course as any).tags)) {
        setSelectedTagIds((course as any).tags.map((t: any) => t.id));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/dashboard/admin/courses');
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const courseData = {
        ...formData,
        price: 0,
        is_free: true,
        duration_hours: formData.duration_hours ? parseFloat(formData.duration_hours) : undefined,
        category_id: formData.category_id || undefined,
        department_id: formData.department_id || undefined,
        difficulty_level: formData.difficulty_level || undefined,
        tag_ids: selectedTagIds,
      };

      await updateCourse(courseId, courseData);
      toast.success('Course updated successfully');
      navigate('/dashboard/admin/courses');
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error(error.response?.data?.error || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      navigate('/dashboard/admin/courses');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-muted">Loading course...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Edit Course</h1>
          <p className="text-text-muted">Update course information</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/courses')}
            className="px-4 py-2 border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-background-card rounded-lg border border-secondary/30 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Course Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Short Description
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="Brief description (shown in course cards)"
                maxLength={150}
              />
              <p className="text-xs text-text-muted mt-1">{formData.short_description.length}/150</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Full Description <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                rows={6}
                placeholder="Detailed course description..."
              />
            </div>
          </div>
        </div>

        {/* Course Settings */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Course Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                disabled={dataLoading}
              >
                <option value="">{dataLoading ? 'Loading...' : 'Select Category'}</option>
                {Array.isArray(categories) && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-1">
                <Hash size={14} /> Tags (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagIds((prev) =>
                          prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs border transition ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-background border-secondary/30 text-text-muted hover:border-primary/50'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
                {tags.length === 0 && (
                  <p className="text-xs text-text-muted">No tags yet. Create some in Admin → Tags.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Department <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                disabled={dataLoading}
              >
                <option value="">{dataLoading ? 'Loading...' : 'Select Department'}</option>
                {Array.isArray(departments) && departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="">Select Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Duration (hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
                placeholder="e.g., 10.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Publication Status */}
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Publication</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-5 h-5 rounded border-secondary/30 text-primary focus:ring-primary"
            />
            <label htmlFor="is_published" className="text-text-primary font-medium">
              Publish this course (make it visible to students)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-secondary/20">
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin/courses')}
            className="px-6 py-2 border border-secondary/30 rounded-lg hover:bg-secondary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}


