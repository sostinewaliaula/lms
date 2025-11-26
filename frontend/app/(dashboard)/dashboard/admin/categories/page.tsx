'use client';

import { useEffect, useMemo, useState } from 'react';
import { Tag, Plus, Edit, Trash2, Search, Layers3, BookOpen, Sparkles } from 'lucide-react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from '@/lib/api/categories';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (tone: 'success' | 'error', title: string, message: string) => {
    const palette =
      tone === 'success'
        ? 'text-green-500 border-green-200 dark:border-green-500/40'
        : 'text-red-500 border-red-200 dark:border-red-500/40';

    toast.custom(
      <div className="relative min-w-[260px] rounded-3xl border bg-background shadow-lg shadow-black/10 dark:shadow-black/40 px-5 py-4">
        <div className="absolute inset-0 rounded-3xl border border-white/40 dark:border-white/10 pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background ${palette}`}>
            {tone === 'success' ? '✓' : '✕'}
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
      { duration: 4000 }
    );
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const cats = await getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('error', 'Unable to load categories', 'Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const query = search.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(query) ||
        cat.slug?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
    );
  }, [categories, search]);

  const summary = useMemo(() => {
    const total = categories.length;
    const featured = categories.filter((cat) => cat.icon).length;
    return { total, featured };
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await updateCategory(editingCat.id, formData);
        showToast('success', 'Category updated', 'Changes saved successfully.');
      } else {
        await createCategory(formData);
        showToast('success', 'Category created', 'Courses can now use this tag.');
      }
      setShowModal(false);
      setEditingCat(null);
      setFormData({ name: '', description: '', icon: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('error', 'Action failed', 'Unable to save category.');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCat(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast('success', 'Category removed', 'It will no longer appear in filters.');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('error', 'Delete failed', 'Unable to remove category.');
    }
    setConfirmDelete(null);
  };

  return (
    <div className="p-6 space-y-6">
      <section className="bg-gradient-to-r from-secondary/15 via-primary/10 to-secondary/15 border border-secondary/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-lg shadow-secondary/10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold">Library</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mt-2">Course Categories</h1>
          <p className="text-text-muted mt-3 max-w-2xl">
            Organize the Knowledge Center with curated learning themes. Use icons and descriptions to help admins pick the right
            bucket for upcoming programs.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="rounded-2xl border border-secondary/40 bg-background-card/80 px-5 py-3 flex items-center gap-3 shadow-lg shadow-secondary/10">
            <Layers3 size={20} className="text-secondary" />
            <div>
              <p className="text-xs uppercase text-text-muted">Total categories</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingCat(null);
              setFormData({ name: '', description: '', icon: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Categories', value: summary.total, icon: Layers3, accent: 'text-primary bg-primary/10' },
          { label: 'Featured', value: summary.featured, icon: Sparkles, accent: 'text-amber-500 bg-amber-500/10' },
          { label: 'Top tag', value: categories[0]?.name || '—', icon: Tag, accent: 'text-secondary bg-secondary/10' },
          { label: 'New courses', value: categories[0]?.courses_count ?? 0, icon: BookOpen, accent: 'text-emerald-500 bg-emerald-500/10' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-secondary/20 bg-background-card p-4 shadow-lg shadow-secondary/10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</p>
              <span className={`rounded-full p-2 ${card.accent}`}>
                <card.icon size={16} />
              </span>
            </div>
            <p className={`mt-3 text-2xl font-semibold ${typeof card.value === 'number' ? 'text-text-primary' : 'text-text-muted'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No categories found</p>
          <p className="text-sm text-text-muted">Try adjusting your search or create a new category to organize content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary text-xl">{cat.icon || <Tag size={20} />}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{cat.name}</h3>
                    <p className="text-xs text-text-muted">{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(cat)} className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setConfirmDelete(cat)} className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-sm text-text-muted mt-4">{cat.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h2 className="text-2xl font-bold text-text-primary mb-1">{editingCat ? 'Edit Category' : 'Create Category'}</h2>
            <p className="text-xs text-text-muted mb-4">Describe how this category should be used.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="e.g., Digital Skills"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Tell admins what content belongs here."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Icon (optional)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Emoji or Lucide icon name"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90">
                  {editingCat ? 'Update category' : 'Create category'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCat(null);
                    setFormData({ name: '', description: '', icon: '' });
                  }}
                  className="flex-1 rounded-xl border border-secondary/30 px-4 py-2.5 text-sm font-semibold text-text-primary hover:border-primary/50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete category?</h3>
            <p className="text-sm text-text-muted mt-2">
              This removes <span className="font-semibold">{confirmDelete.name}</span> from the library. Courses remain
              published but lose this tag.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 hover:bg-red-500/90">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

