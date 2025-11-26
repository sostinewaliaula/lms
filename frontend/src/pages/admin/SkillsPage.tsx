import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Layers3, Users, BookOpen, Edit, Trash2, Plus, Search } from 'lucide-react';
import { getSkills, createSkill, updateSkill, deleteSkill, Skill } from '@/lib/api/skills';
import toast from '@/lib/toast';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Skill | null>(null);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_skill_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const showToast = (title: string, message: string) => {
    toastSuccess(title, {
      subtitle: message,
      duration: 3500,
    });
  };

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await getSkills();
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Unable to load skills.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return skills;
    const q = search.toLowerCase();
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }, [skills, search]);

  const summary = useMemo(() => {
    const total = skills.length;
    const withCourses = skills.filter((s) => (s.courses_count || 0) > 0).length;
    const withUsers = skills.filter((s) => (s.users_count || 0) > 0).length;
    return { total, withCourses, withUsers };
  }, [skills]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        parent_skill_id: formData.parent_skill_id || undefined,
      };
      if (editingSkill) {
        await updateSkill(editingSkill.id, payload);
        showToast('Skill updated', 'Skill details saved.');
      } else {
        await createSkill(payload);
        showToast('Skill created', 'Skill added to catalog.');
      }
      setShowModal(false);
      setEditingSkill(null);
      setFormData({ name: '', description: '', parent_skill_id: '' });
      fetchSkills();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error('Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || '',
      parent_skill_id: skill.parent_skill_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      showToast('Skill removed', 'Skill deleted from catalog.');
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill.');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-secondary/15 via-background-card to-background shadow-lg shadow-secondary/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold">Capability map</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Skills matrix</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Define the skills your organization cares about and see how they connect to courses and people.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Skills</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
            <Layers3 size={20} className="text-secondary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Linked courses</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.withCourses}</p>
            </div>
            <BookOpen size={20} className="text-primary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Linked users</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.withUsers}</p>
            </div>
            <Users size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingSkill(null);
              setFormData({ name: '', description: '', parent_skill_id: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add skill
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading skills...</div>
      ) : filteredSkills.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No skills defined</p>
          <p className="text-sm text-text-muted">Create a few skills to start mapping capabilities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-text-muted">Skill</p>
                  <h2 className="text-lg font-semibold text-text-primary">{skill.name}</h2>
                  <p className="text-xs text-text-muted">{skill.slug}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleEdit(skill)}
                    className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(skill)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {skill.description && <p className="text-sm text-text-muted mt-3">{skill.description}</p>}
              <div className="mt-4 flex items-center gap-4 text-[11px] text-text-muted">
                <span>
                  <BookOpen size={11} className="inline mr-1" />
                  {skill.courses_count ?? 0} courses
                </span>
                <span>
                  <Users size={11} className="inline mr-1" />
                  {skill.users_count ?? 0} learners
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20 space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              {editingSkill ? 'Edit skill' : 'Create skill'}
            </h2>
            <p className="text-xs text-text-muted">
              Describe the capability and optionally nest it under a broader skill.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="e.g., Data Analysis"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="How this skill is demonstrated in practice."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">
                  Parent skill (optional)
                </label>
                <select
                  value={formData.parent_skill_id}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parent_skill_id: e.target.value || '' }))
                  }
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">None</option>
                  {skills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSkill(null);
                    setFormData({ name: '', description: '', parent_skill_id: '' });
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
                  {saving ? 'Saving…' : editingSkill ? 'Update skill' : 'Create skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete skill?</h3>
            <p className="text-sm text-text-muted mt-2">
              This removes <span className="font-semibold">{confirmDelete.name}</span> from the catalog. Existing course
              mappings will be cleared at the data layer.
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


