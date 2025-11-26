'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  User,
  Crown,
  UserPlus,
  X,
  Filter,
} from 'lucide-react';
import {
  getStudyGroups,
  createStudyGroup,
  updateStudyGroup,
  deleteStudyGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  StudyGroup,
  GroupMember,
} from '@/lib/api/studyGroups';
import { getCourses, Course } from '@/lib/api/courses';
import { getUsers, User as UserType } from '@/lib/api/users';
import toast from 'react-hot-toast';

export default function AdminStudyGroupsPage() {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<StudyGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<StudyGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course_id: '',
    max_members: 20,
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');

  useEffect(() => {
    fetchData();
    fetchCourses();
    fetchUsers();
  }, [filterCourse]);

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
      const data = await getStudyGroups({
        course_id: filterCourse || undefined,
      });
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading study groups:', error);
      toast.error('Unable to load study groups.');
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

  const fetchUsers = async () => {
    try {
      const { users: usersData } = await getUsers({ limit: 1000 });
      setAllUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const fetchMembers = async (groupId: string) => {
    try {
      const membersData = await getGroupMembers(groupId);
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error) {
      console.error('Error loading members:', error);
      toast.error('Unable to load members.');
    }
  };

  const filteredGroups = useMemo(() => {
    let filtered = groups;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description?.toLowerCase().includes(q) ||
          g.course_title?.toLowerCase().includes(q) ||
          g.creator_name?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [groups, search]);

  const summary = useMemo(() => {
    const total = groups.length;
    const withCourse = groups.filter((g) => g.course_id).length;
    const totalMembers = groups.reduce((sum, g) => sum + (g.members_count || 0), 0);
    return { total, withCourse, totalMembers };
  }, [groups]);

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
        course_id: formData.course_id || undefined,
        max_members: formData.max_members,
      };
      if (editingGroup) {
        await updateStudyGroup(editingGroup.id, payload);
        showToast('Study group updated', 'Group details saved.');
      } else {
        await createStudyGroup(payload);
        showToast('Study group created', 'Group added successfully.');
      }
      setShowModal(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', course_id: '', max_members: 20 });
      fetchData();
    } catch (error) {
      console.error('Error saving study group:', error);
      toast.error('Failed to save study group.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (group: StudyGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      course_id: group.course_id || '',
      max_members: group.max_members,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStudyGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      showToast('Study group removed', 'Group deleted successfully.');
    } catch (error) {
      console.error('Error deleting study group:', error);
      toast.error('Failed to delete study group.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleViewMembers = async (groupId: string) => {
    setShowMembersModal(groupId);
    await fetchMembers(groupId);
  };

  const handleAddMember = async (groupId: string) => {
    if (!newMemberUserId) {
      toast.error('Please select a user.');
      return;
    }
    setAddingMember(true);
    try {
      await addGroupMember(groupId, newMemberUserId);
      showToast('Member added', 'User added to group.');
      setNewMemberUserId('');
      await fetchMembers(groupId);
      fetchData(); // Refresh groups to update member count
    } catch (error: any) {
      console.error('Error adding member:', error);
      toast.error(error?.response?.data?.error || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await removeGroupMember(groupId, userId);
      showToast('Member removed', 'User removed from group.');
      await fetchMembers(groupId);
      fetchData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member.');
    }
  };

  const handleUpdateRole = async (groupId: string, userId: string, role: 'admin' | 'member') => {
    try {
      await updateMemberRole(groupId, userId, role);
      showToast('Role updated', `Member role changed to ${role}.`);
      await fetchMembers(groupId);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role.');
    }
  };

  const availableUsers = useMemo(() => {
    if (!showMembersModal) return [];
    const memberUserIds = new Set(members.map((m) => m.user_id));
    return allUsers.filter((u) => !memberUserIds.has(u.id));
  }, [allUsers, members, showMembersModal]);

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-blue-500/15 via-background-card to-background shadow-lg shadow-blue-500/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">Collaboration hub</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Study Groups</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Create and manage study groups to facilitate peer learning and collaboration among learners.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Groups</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
            <Users size={20} className="text-primary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">With course</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.withCourse}</p>
            </div>
            <BookOpen size={20} className="text-blue-500" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Total members</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.totalMembers}</p>
            </div>
            <User size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingGroup(null);
              setFormData({ name: '', description: '', course_id: '', max_members: 20 });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Add Group
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading study groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No study groups found</p>
          <p className="text-sm text-text-muted">
            {search || filterCourse ? 'Try adjusting your filters.' : 'Create a study group to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-text-primary mb-1">{group.name}</h2>
                  {group.course_title && (
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
                      <BookOpen size={12} />
                      <span>{group.course_title}</span>
                    </div>
                  )}
                  {group.description && (
                    <p className="text-sm text-text-muted line-clamp-2">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleEdit(group)}
                    className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                    title="Edit group"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(group)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                    title="Delete group"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Created by: {group.creator_name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    <Users size={12} className="inline mr-1" />
                    {group.members_count || 0} / {group.max_members} members
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewMembers(group.id)}
                  className="w-full mt-3 rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm font-medium text-text-primary hover:border-primary transition"
                >
                  Manage Members
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20 space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              {editingGroup ? 'Edit Study Group' : 'Create Study Group'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="e.g., Advanced JavaScript Study Group"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="What is this group about?"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Course (optional)</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, course_id: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">No course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Max Members</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_members}
                  onChange={(e) => setFormData((prev) => ({ ...prev, max_members: parseInt(e.target.value) || 20 }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingGroup(null);
                    setFormData({ name: '', description: '', course_id: '', max_members: 20 });
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
                  {saving ? 'Saving…' : editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-2xl border border-secondary/30 shadow-2xl shadow-secondary/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-primary">Manage Members</h2>
              <button
                onClick={() => {
                  setShowMembersModal(null);
                  setMembers([]);
                  setNewMemberUserId('');
                }}
                className="rounded-full border border-secondary/30 p-2 text-text-muted hover:border-primary"
              >
                <X size={18} />
              </button>
            </div>
            <div className="border-t border-secondary/20 pt-4 space-y-4">
              <div className="flex gap-3">
                <select
                  value={newMemberUserId}
                  onChange={(e) => setNewMemberUserId(e.target.value)}
                  className="flex-1 rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  <option value="">Select user to add...</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleAddMember(showMembersModal)}
                  disabled={!newMemberUserId || addingMember}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
                >
                  <UserPlus size={16} className="inline mr-1" />
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {members.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No members yet</p>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-secondary/30 bg-background"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">
                            {member.user_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-text-muted">{member.user_email}</p>
                        </div>
                        {member.role === 'admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] font-semibold">
                            <Crown size={10} />
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateRole(showMembersModal, member.user_id, e.target.value as 'admin' | 'member')
                          }
                          className="rounded-lg border border-secondary/30 bg-background px-2 py-1 text-xs text-text-primary focus:border-primary focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(showMembersModal, member.user_id)}
                          className="rounded-lg border border-red-400/30 p-1.5 text-red-400 hover:border-red-400"
                          title="Remove member"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete Study Group?</h3>
            <p className="text-sm text-text-muted mt-2">
              This will permanently remove <span className="font-semibold">{confirmDelete.name}</span> and all its
              members. This action cannot be undone.
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

