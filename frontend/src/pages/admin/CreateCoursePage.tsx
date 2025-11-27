import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Save, X, Hash, ArrowLeft } from 'lucide-react';
import { createCourse } from '@/lib/api/courses';
import { getCategories } from '@/lib/api/categories';
import { getDepartments } from '@/lib/api/departments';
import { getTags, Tag } from '@/lib/api/tags';
import toast, { toastSuccess, toastError } from '@/lib/toast';

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
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
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const [cats, depts, tagsData] = await Promise.all([getCategories(), getDepartments(), getTags()]);
      setCategories(Array.isArray(cats) ? cats : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setTags(Array.isArray(tagsData) ? tagsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setCategories([]);
      setDepartments([]);
      setTags([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      const course = await createCourse(courseData);
      toastSuccess('Course created', {
        subtitle: 'You can now add modules and content to your course.',
      });
      navigate(`/dashboard/admin/courses/${course.id}/edit`);
    } catch (error: any) {
      console.error('Error creating course:', error);
      toastError('Failed to create course', {
        subtitle: error?.response?.data?.error || 'Please check your input and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/dashboard/admin/courses"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Course</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Start by adding basic information about your course
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Introduction to Web Development"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Brief description shown in course cards"
                    maxLength={150}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formData.short_description.length}/150 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={6}
                    placeholder="Provide a detailed description of what students will learn in this course..."
                  />
                </div>
              </div>
            </div>

            {/* Course Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={dataLoading}
                  >
                    <option value="">{dataLoading ? 'Loading...' : 'Select Category'}</option>
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
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={dataLoading}
                  >
                    <option value="">{dataLoading ? 'Loading...' : 'Select Department (Optional)'}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Courses can be assigned to departments later
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 10.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No tags available. Create tags in Admin → Tags.
                  </p>
                ) : (
                  tags.map((tag) => {
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          active
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <Hash size={14} className="inline mr-1" />
                        {tag.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
            <Link
              to="/dashboard/admin/courses"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Save size={18} />
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
