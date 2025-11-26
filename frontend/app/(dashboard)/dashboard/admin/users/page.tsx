'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Search,
  Edit3,
  UserPlus,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Power,
  Trash2,
} from 'lucide-react';
import { getUsers, updateUser, deleteUser, createUser, User as UserType } from '@/lib/api/users';
import { getDepartments } from '@/lib/api/departments';
import toast from 'react-hot-toast';

type EditFormState = {
  first_name: string;
  last_name: string;
  email: string;
  role: UserType['role'];
  department_id: string;
  is_active: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'delete'; user: UserType | null } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'student',
    department_id: '',
    is_active: true,
  });
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'student' as UserType['role'],
    department_id: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, deptFilter, search]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditForm({
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        role: selectedUser.role,
        department_id: selectedUser.department_id || '',
        is_active: selectedUser.is_active,
      });
    }
  }, [selectedUser]);

  const userSummary = useMemo(() => {
    const active = users.filter((user) => user.is_active).length;
    const inactive = users.length - active;
    const admins = users.filter((user) => user.role === 'admin').length;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newThisMonth = users.filter((user) => new Date(user.created_at) >= startOfMonth).length;

    return { active, inactive, admins, newThisMonth };
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (statusFilter === 'all') return users;
    return users.filter((user) => (statusFilter === 'active' ? user.is_active : !user.is_active));
  }, [users, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('[AdminUsers] Fetching users', {
        search,
        role: roleFilter,
        department: deptFilter,
        page,
        limit,
      });
      const response = await getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        department_id: deptFilter || undefined,
        limit,
        offset: (page - 1) * limit,
      });
      console.log('[AdminUsers] Users response', response);
      setUsers(Array.isArray(response.users) ? response.users : []);
      setTotal(typeof response.total === 'number' ? response.total : 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Unable to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await getDepartments();
      console.log('[AdminUsers] Departments response', depts);
      setDepartments(Array.isArray(depts) ? depts : depts?.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to deactivate user');
      return;
    }
    toast.success('User deactivated');
  };

  const handleHardDelete = async (id: string) => {
    try {
      await deleteUser(id, { hard: true });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return;
    }
    toast.success('User deleted permanently');
  };

  const handleToggleStatus = async (user: UserType) => {
    if (user.is_active) {
      setConfirmAction({ type: 'deactivate', user });
      return;
    }

    try {
      await updateUser(user.id, { is_active: true });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
      return;
    }
    toast.success('User reactivated');
  };

  const handleEditChange = (field: keyof EditFormState, value: string | boolean) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeModal = () => {
    setSelectedUser(null);
    setSaving(false);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      await updateUser(selectedUser.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        role: editForm.role,
        department_id: editForm.department_id || null,
        is_active: editForm.is_active,
      });
      closeModal();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return;
    } finally {
      setSaving(false);
    }
    toast.success('User updated');
  };

  const handleCreateChange = (field: keyof typeof createForm, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetCreateForm = () => {
    setCreateForm({
      first_name: '',
      last_name: '',
      email: '',
      role: 'student',
      department_id: '',
      password: '',
    });
  };

  const handleCreateUser = async () => {
    if (!createForm.first_name || !createForm.last_name || !createForm.email || !createForm.password) {
      toast.error('Please provide name, email, and a temporary password.');
      return;
    }

    setCreating(true);
    try {
      await createUser({
        ...createForm,
        department_id: createForm.department_id || undefined,
      });
      resetCreateForm();
      setShowCreateModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error?.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
    toast.success('User created');
  };

  const handleConfirmAction = async () => {
    if (!confirmAction?.user) return;
    setConfirmLoading(true);
    try {
      if (confirmAction.type === 'deactivate') {
        await handleDeactivate(confirmAction.user.id);
      } else {
        await handleHardDelete(confirmAction.user.id);
      }
      setConfirmAction(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setDeptFilter('');
    setStatusFilter('all');
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400';
      case 'instructor':
        return 'bg-blue-500/20 text-blue-400';
      case 'student':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="bg-gradient-to-r from-primary/15 via-secondary/10 to-primary/15 border border-primary/20 rounded-3xl p-6 lg:p-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-lg shadow-primary/10">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">People Ops</p>
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mt-2">User Management</h1>
          <p className="text-text-muted mt-3 max-w-2xl">
            Monitor account health, adjust access levels, and keep your Knowledge Center roster up to date.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={fetchUsers}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-text-primary hover:bg-secondary/10 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <UserPlus size={18} />
            Add User
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Users',
            value: total,
            icon: Users,
            accent: 'bg-primary/10 text-primary',
            helper: `${userSummary.newThisMonth} joined this month`,
          },
          {
            label: 'Active',
            value: userSummary.active,
            icon: UserCheck,
            accent: 'bg-green-500/10 text-green-500',
            helper: `${userSummary.inactive} inactive`,
          },
          {
            label: 'Inactive',
            value: userSummary.inactive,
            icon: UserX,
            accent: 'bg-red-500/10 text-red-400',
            helper: 'Requires review',
          },
          {
            label: 'Admins',
            value: userSummary.admins,
            icon: ShieldCheck,
            accent: 'bg-secondary/10 text-secondary',
            helper: 'Access control',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-secondary/20 bg-background-card p-4 shadow-lg shadow-secondary/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</p>
              <span className={`rounded-full p-2 ${card.accent}`}>
                <card.icon size={16} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold text-text-primary">{card.value ?? 0}</p>
            <p className="text-xs text-text-muted mt-1">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">All departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">Status</span>
          {[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ].map((chip) => (
            <button
              key={chip.value}
              onClick={() => setStatusFilter(chip.value as 'all' | 'active' | 'inactive')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${
                statusFilter === chip.value
                  ? 'bg-primary text-white border-primary'
                  : 'border-secondary/30 text-text-muted hover:border-primary/50'
              }`}
            >
              {chip.label}
            </button>
          ))}
          <button
            onClick={resetFilters}
            className="ml-auto text-sm font-semibold text-primary hover:text-primary/80"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="bg-background-card rounded-2xl border border-secondary/30 shadow-xl shadow-secondary/10 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-muted">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-text-muted">
            No users match the current filters. Try adjusting your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Member Since
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/20">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold uppercase">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.first_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">{user.department_name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-text-muted">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {user.stats ? (
                        <div className="space-y-1">
                          <p>Courses: {user.stats.enrolled_courses || 0}</p>
                          <p>Completed: {user.stats.completed_courses || 0}</p>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary hover:bg-primary/10 transition"
                          aria-label="Edit user"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmAction({ type: 'delete', user })}
                          className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400 hover:bg-red-500/10 transition"
                          aria-label="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`rounded-full border p-2 transition ${
                            user.is_active
                              ? 'border-red-200 text-red-400 hover:bg-red-500/10'
                              : 'border-green-200 text-green-400 hover:bg-green-500/10'
                          }`}
                          aria-label={user.is_active ? 'Deactivate user' : 'Activate user'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > limit && (
        <div className="flex flex-col gap-3 border-t border-secondary/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            Showing {(page - 1) * limit + 1} – {Math.min(page * limit, total)} of {total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/50"
            >
              Previous
            </button>
            <span className="text-xs text-text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-50 hover:border-primary/50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-background-card border border-secondary/30 p-6 shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Update user</p>
                <h2 className="text-2xl font-semibold text-text-primary mt-1">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h2>
              </div>
              <button className="text-text-muted hover:text-text-primary" onClick={closeModal}>
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">First name</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => handleEditChange('first_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Last name</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => handleEditChange('last_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditChange('email', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditChange('role', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Department</label>
                <select
                  value={editForm.department_id}
                  onChange={(e) => handleEditChange('department_id', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Status</label>
                <button
                  type="button"
                  onClick={() => handleEditChange('is_active', !editForm.is_active)}
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    editForm.is_active
                      ? 'border-green-300 bg-green-500/10 text-green-500'
                      : 'border-red-300 bg-red-500/10 text-red-400'
                  }`}
                >
                  {editForm.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? 'Updating...' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction?.user && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-background-card border border-secondary/30 p-6 shadow-2xl shadow-primary/20">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">
                {confirmAction.type === 'deactivate' ? 'Deactivate User' : 'Delete User'}
              </p>
              <h3 className="text-2xl font-semibold text-text-primary">
                {confirmAction.user.first_name} {confirmAction.user.last_name}
              </h3>
              <p className="text-sm text-text-muted">
                {confirmAction.type === 'deactivate'
                  ? 'This user will immediately lose access but can be reactivated later.'
                  : 'This permanently removes the user and their profile. This action cannot be undone.'}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50"
                disabled={confirmLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmLoading}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${
                  confirmAction.type === 'deactivate'
                    ? 'bg-amber-500 hover:bg-amber-500/90 shadow-amber-500/30'
                    : 'bg-red-500 hover:bg-red-500/90 shadow-red-500/30'
                } disabled:opacity-60`}
              >
                {confirmLoading
                  ? 'Processing...'
                  : confirmAction.type === 'deactivate'
                  ? 'Deactivate'
                  : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-background-card border border-secondary/30 p-6 shadow-2xl shadow-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold">Create user</p>
                <h2 className="text-2xl font-semibold text-text-primary mt-1">Invite to Knowledge Center</h2>
              </div>
              <button className="text-text-muted hover:text-text-primary" onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">First name</label>
                <input
                  type="text"
                  value={createForm.first_name}
                  onChange={(e) => handleCreateChange('first_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Last name</label>
                <input
                  type="text"
                  value={createForm.last_name}
                  onChange={(e) => handleCreateChange('last_name', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => handleCreateChange('email', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => handleCreateChange('role', e.target.value as UserType['role'])}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Department</label>
                <select
                  value={createForm.department_id}
                  onChange={(e) => handleCreateChange('department_id', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-muted uppercase">Temporary password</label>
                <input
                  type="text"
                  value={createForm.password}
                  onChange={(e) => handleCreateChange('password', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="Provide initial password"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="rounded-xl border border-secondary/30 px-4 py-2 text-sm font-medium text-text-primary hover:border-primary/50"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={creating}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

