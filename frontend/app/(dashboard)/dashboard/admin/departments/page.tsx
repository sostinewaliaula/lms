'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, Edit, Trash2, Users, BookOpen, GraduationCap, Search, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
} from '@/lib/api/departments';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Department | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const depts = await getDepartments();
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Unable to load departments');
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
      { duration: 4000 }
    );
  };

  const filteredDepartments = useMemo(() => {
    if (!search.trim()) return departments;
    const query = search.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.name.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query) ||
        `${dept.manager_first_name || ''} ${dept.manager_last_name || ''}`.toLowerCase().includes(query)
    );
  }, [departments, search]);

  const departmentSummary = useMemo(() => {
    const total = departments.length;
    const courses = departments.reduce((sum, dept) => sum + (dept.stats?.total_courses || 0), 0);
    const usersCount = departments.reduce((sum, dept) => sum + (dept.stats?.total_users || 0), 0);
    const enrollments = departments.reduce((sum, dept) => sum + (dept.stats?.total_enrollments || 0), 0);
    return { total, courses, usersCount, enrollments };
  }, [departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
        showToast('success', 'Department updated', 'Changes saved successfully.');
      } else {
        await createDepartment(formData);
        showToast('success', 'Department created', 'The team can now add courses here.');
      }
      setShowModal(false);
      setEditingDept(null);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      showToast('error', 'Action failed', 'Unable to save department.');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDepartment(id);
      showToast('success', 'Department removed', 'It will no longer appear to admins.');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      showToast('error', 'Delete failed', 'Unable to remove department.');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 border border-primary/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-lg shadow-primary/10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">Organization</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mt-2">Departments</h1>
          <p className="text-text-muted mt-3 max-w-2xl">
            Curate training experiences for each business unit. Add new departments, assign managers, and track learning
            health from a single view.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="rounded-2xl border border-secondary/40 bg-background-card/80 px-5 py-3 flex items-center gap-3 shadow-lg shadow-secondary/10">
            <Sparkles size={20} className="text-primary" />
            <div>
              <p className="text-xs uppercase text-text-muted">Active departments</p>
              <p className="text-2xl font-semibold text-text-primary">{departmentSummary.total}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingDept(null);
              setFormData({ name: '', description: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Department
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Courses', value: departmentSummary.courses, icon: BookOpen, accent: 'text-primary bg-primary/10' },
          { label: 'Learners', value: departmentSummary.usersCount, icon: Users, accent: 'text-secondary bg-secondary/10' },
          {
            label: 'Enrollments',
            value: departmentSummary.enrollments,
            icon: GraduationCap,
            accent: 'text-amber-500 bg-amber-500/10',
          },
          { label: 'Teams', value: departmentSummary.total, icon: Building2, accent: 'text-emerald-500 bg-emerald-500/10' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-secondary/20 bg-background-card p-4 shadow-lg shadow-secondary/10">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</p>
              <span className={`rounded-full p-2 ${card.accent}`}>
                <card.icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{card.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search departments or managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading departments...</div>
      ) : filteredDepartments.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No departments found</p>
          <p className="text-sm text-text-muted">
            Try adjusting your search or create a new department tailored to your teams.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="group relative rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{dept.name}</h3>
                    {dept.manager_first_name && (
                      <p className="text-xs text-text-muted">
                        Manager: {dept.manager_first_name} {dept.manager_last_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleEdit(dept)} className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => setConfirmDelete(dept)} className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {dept.description && <p className="text-sm text-text-muted mt-4">{dept.description}</p>}

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-2xl border border-secondary/20 p-4">
                <div>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <BookOpen size={14} /> Courses
                  </p>
                  <p className="text-lg font-semibold text-text-primary">{dept.stats?.total_courses || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <Users size={14} /> Users
                  </p>
                  <p className="text-lg font-semibold text-text-primary">{dept.stats?.total_users || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <GraduationCap size={14} /> Enroll.
                  </p>
                  <p className="text-lg font-semibold text-text-primary">{dept.stats?.total_enrollments || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-bold text-text-primary mb-1">{editingDept ? 'Edit Department' : 'Create Department'}</h2>
            <p className="text-xs text-text-muted mb-4">Give your team a name and add a quick description.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Focus, programs, or audience..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90">
                  {editingDept ? 'Update department' : 'Create department'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDept(null);
                    setFormData({ name: '', description: '' });
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
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-primary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Remove department?</h3>
            <p className="text-sm text-text-muted mt-2">
              This will delete <span className="font-semibold">{confirmDelete.name}</span>. Courses remain untouched, but you’ll need
              to reassign them manually.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50">
                Cancel
              </button>
              <button
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

