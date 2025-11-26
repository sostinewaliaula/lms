'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Search,
  Trash2,
  Filter,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  User,
  Mail,
  ExternalLink,
  Eye,
} from 'lucide-react';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  getNotificationStats,
  Notification,
  NotificationStats,
} from '@/lib/api/notifications';
import { getUsers, User as UserType } from '@/lib/api/users';
import toast from 'react-hot-toast';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Notification | null>(null);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    user_id: '',
    type: 'info',
    title: '',
    message: '',
    link: '',
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    user_id: '',
    type: '',
    is_read: '',
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
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
      const [notificationsData, statsData] = await Promise.all([
        getNotifications({
          user_id: filters.user_id || undefined,
          type: filters.type || undefined,
          is_read:
            filters.is_read === ''
              ? undefined
              : filters.is_read === 'true',
        }),
        getNotificationStats(),
      ]);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { users: usersData } = await getUsers({ limit: 1000 });
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.message?.toLowerCase().includes(q) ||
          n.user_name?.toLowerCase().includes(q) ||
          n.user_email?.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [notifications, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.title) {
      toast.error('User and title are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        user_id: formData.user_id,
        type: formData.type,
        title: formData.title,
        message: formData.message || undefined,
        link: formData.link || undefined,
      };
      if (editingNotification) {
        await updateNotification(editingNotification.id, payload);
        showToast('Notification updated', 'Notification details saved.');
      } else {
        await createNotification(payload);
        showToast('Notification created', 'Notification sent successfully.');
      }
      setShowModal(false);
      setEditingNotification(null);
      setFormData({ user_id: '', type: 'info', title: '', message: '', link: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast.error('Failed to save notification.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      user_id: notification.user_id,
      type: notification.type,
      title: notification.title,
      message: notification.message || '',
      link: notification.link || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      showToast('Notification removed', 'Notification deleted successfully.');
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification.');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      showToast('Marked as read', 'Notification marked as read.');
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'success':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'error':
      case 'danger':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'info':
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const notificationTypes = ['info', 'success', 'warning', 'error', 'course', 'achievement', 'message', 'system'];

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-blue-500/15 via-background-card to-background shadow-lg shadow-blue-500/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-semibold">Communication hub</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Notifications Center</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Manage and monitor all system notifications sent to users across the platform.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Total</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.total || 0}</p>
            </div>
            <Bell size={20} className="text-primary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Unread</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.unread || 0}</p>
            </div>
            <Mail size={20} className="text-blue-500" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Read</p>
              <p className="text-2xl font-semibold text-text-primary">
                {(stats?.total || 0) - (stats?.unread || 0)}
              </p>
            </div>
            <CheckCircle size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      {stats && stats.by_type.length > 0 && (
        <div className="bg-background-card border border-secondary/30 rounded-2xl p-5 shadow-lg shadow-primary/5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">By Type</h3>
          <div className="flex flex-wrap gap-3">
            {stats.by_type.map((item) => (
              <div
                key={item.type}
                className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20"
              >
                <span className="text-xs text-text-muted uppercase mr-2">{item.type}</span>
                <span className="text-sm font-semibold text-text-primary">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5 space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by title, message, user, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingNotification(null);
              setFormData({ user_id: '', type: 'info', title: '', message: '', link: '' });
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
          >
            <Plus size={18} />
            Send Notification
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted" />
            <span className="text-xs font-semibold text-text-muted uppercase">Filters:</span>
          </div>
          <select
            value={filters.user_id}
            onChange={(e) => setFilters((prev) => ({ ...prev, user_id: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Types</option>
            {notificationTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filters.is_read}
            onChange={(e) => setFilters((prev) => ({ ...prev, is_read: e.target.value }))}
            className="rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading notifications...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No notifications found</p>
          <p className="text-sm text-text-muted">
            {search || Object.values(filters).some((f) => f) ? 'Try adjusting your filters.' : 'No notifications have been sent yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group rounded-3xl border ${
                notification.is_read
                  ? 'border-secondary/30 bg-background-card'
                  : 'border-primary/50 bg-gradient-to-r from-primary/5 to-background-card'
              } p-6 shadow-lg shadow-secondary/10 hover:border-primary transition`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bell size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text-primary">{notification.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTypeColor(notification.type)}`}
                        >
                          {notification.type}
                        </span>
                        {!notification.is_read && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                        <User size={12} />
                        <span>{notification.user_name || 'Unknown User'}</span>
                        <span>•</span>
                        <span>{notification.user_email}</span>
                      </div>
                      {notification.message && (
                        <p className="text-sm text-text-primary leading-relaxed">{notification.message}</p>
                      )}
                      {notification.link && (
                        <a
                          href={notification.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink size={12} />
                          View link
                        </a>
                      )}
                      <p className="text-xs text-text-muted">
                        {new Date(notification.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="rounded-full border border-secondary/30 p-2 text-emerald-500 hover:border-emerald-500"
                      title="Mark as read"
                    >
                      <Eye size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEdit(notification)}
                    className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                    title="Edit notification"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(notification)}
                    className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20 space-y-4">
            <h2 className="text-2xl font-bold text-text-primary">
              {editingNotification ? 'Edit Notification' : 'Send Notification'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">User</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, user_id: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select user...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                >
                  {notificationTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="Notification title"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="Notification message (optional)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingNotification(null);
                    setFormData({ user_id: '', type: 'info', title: '', message: '', link: '' });
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
                  {saving ? 'Saving…' : editingNotification ? 'Update' : 'Send Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete Notification?</h3>
            <p className="text-sm text-text-muted mt-2">
              This will permanently remove the notification for{' '}
              <span className="font-semibold">{confirmDelete.user_name}</span>. This action cannot be undone.
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

