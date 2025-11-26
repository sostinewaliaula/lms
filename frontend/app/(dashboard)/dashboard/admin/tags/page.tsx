'use client';

import { useEffect, useMemo, useState } from 'react';
import { Hash, Plus, Edit3, Trash2, Search, Layers3 } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag, Tag } from '@/lib/api/tags';
import toast from 'react-hot-toast';

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Tag | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      showToast('error', 'Unable to load tags', 'Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

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
      { duration: 3500 }
    );
  };

  const filteredTags = useMemo(() => {
    if (!search.trim()) return tags;
    const q = search.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(q) ||
        tag.slug?.toLowerCase().includes(q) ||
        tag.description?.toLowerCase().includes(q)
    );
  }, [tags, search]);

  const summary = useMemo(() => {
    const total = tags.length;
    const used = tags.filter((t) => (t.courses_count || 0) > 0).length;
    return { total, used };
  }, [tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('error', 'Name is required', 'Add a label for this tag.');
      return;
    }
    setSaving(true);
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        showToast('success', 'Tag updated', 'Changes saved successfully.');
      } else {
        await createTag(formData);
        showToast('success', 'Tag created', 'Courses can now use this tag.');
      }
      setShowModal(false);
      setEditingTag(null);
      setFormData({ name: '', description: '', icon: '' });
      fetchTags();
    } catch (error: any) {
      console.error('Error saving tag:', error);
      showToast('error', 'Action failed', error?.response?.data?.error || 'Unable to save tag.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      icon: tag.icon || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
      showToast('success', 'Tag removed', 'It will no longer appear on courses.');
    } catch (error) {
      console.error('Error deleting tag:', error);
      showToast('error', 'Delete failed', 'Unable to remove tag.');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-secondary/20 via-background-card to-background shadow-lg shadow-secondary/20 p-6 lg:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Hash size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold">Taxonomy</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Tags</h1>
            </div>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            Lightweight labels that cut across departments and categories. Use tags to highlight topics, technologies,
            or internal initiatives.
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Total tags</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
            <Layers3 size={18} className="text-secondary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">In use</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.used}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingTag(null);
              setFormData({ name: '', description: '', icon: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Tag
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading tags...</div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No tags yet</p>
          <p className="text-sm text-text-muted">Create your first tag to start grouping courses by topics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="group rounded-3xl border border-secondary/30 bg-background-card p-5 shadow-lg shadow-secondary/10 hover:border-primary transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-secondary/10 text-secondary text-xl">
                    {tag.icon || <Hash size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{tag.name}</h3>
                    <p className="text-[11px] text-text-muted">{tag.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleEdit(tag)}
                    className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(tag)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {tag.description && <p className="text-xs text-text-muted mt-3">{tag.description}</p>}
              <p className="mt-3 text-[11px] text-text-muted">
                Used in {tag.courses_count ?? 0} {tag.courses_count === 1 ? 'course' : 'courses'}
              </p>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h2 className="text-2xl font-bold text-text-primary mb-1">
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </h2>
            <p className="text-xs text-text-muted mb-4">Name, describe, and optionally add an icon for this tag.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="e.g., Cloud, Compliance, Leadership"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Give admins context for when to use this tag."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Emoji or icon name"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : editingTag ? 'Update tag' : 'Create tag'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTag(null);
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
            <h3 className="text-2xl font-semibold text-text-primary">Delete tag?</h3>
            <p className="text-sm text-text-muted mt-2">
              This removes <span className="font-semibold">{confirmDelete.name}</span> from the catalog. Courses keep
              their content but lose this label.
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


