import { useEffect, useMemo, useState } from 'react';
import { Award, Trophy, Medal, Star, Edit, Trash2, Plus, Search, Users, Sparkles } from 'lucide-react';
import { getBadges, createBadge, updateBadge, deleteBadge, Badge } from '@/lib/api/badges';
import { getAchievements, createAchievement, updateAchievement, deleteAchievement, Achievement } from '@/lib/api/achievements';
import toast from '@/lib/toast';

type TabType = 'badges' | 'achievements';

export default function AdminBadgesAchievementsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('badges');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Badge | Achievement | null>(null);
  const [editingItem, setEditingItem] = useState<Badge | Achievement | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    badge_type: 'course_completion',
    points: 0,
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const showToast = (title: string, message: string) => {
    toastSuccess(title, {
      subtitle: message,
      duration: 3500,
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'badges') {
        const data = await getBadges();
        setBadges(Array.isArray(data) ? data : []);
      } else {
        const data = await getAchievements();
        setAchievements(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(`Unable to load ${activeTab}.`);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const items = activeTab === 'badges' ? badges : achievements;
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        (activeTab === 'badges' && (item as Badge).badge_type?.toLowerCase().includes(q))
    );
  }, [badges, achievements, search, activeTab]);

  const summary = useMemo(() => {
    if (activeTab === 'badges') {
      const total = badges.length;
      const earned = badges.reduce((sum, b) => sum + (b.users_count || 0), 0);
      return { total, earned };
    } else {
      const total = achievements.length;
      const earned = achievements.reduce((sum, a) => sum + (a.users_count || 0), 0);
      const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);
      return { total, earned, totalPoints };
    }
  }, [badges, achievements, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    if (activeTab === 'badges' && !formData.badge_type) {
      toast.error('Badge type is required.');
      return;
    }
    setSaving(true);
    try {
      if (activeTab === 'badges') {
        const payload = {
          name: formData.name,
          description: formData.description || undefined,
          icon_url: formData.icon_url || undefined,
          badge_type: formData.badge_type,
        };
        if (editingItem) {
          await updateBadge(editingItem.id, payload);
          showToast('Badge updated', 'Badge details saved.');
        } else {
          await createBadge(payload);
          showToast('Badge created', 'Badge added to catalog.');
        }
      } else {
        const payload = {
          name: formData.name,
          description: formData.description || undefined,
          icon_url: formData.icon_url || undefined,
          points: formData.points || 0,
        };
        if (editingItem) {
          await updateAchievement(editingItem.id, payload);
          showToast('Achievement updated', 'Achievement details saved.');
        } else {
          await createAchievement(payload);
          showToast('Achievement created', 'Achievement added to catalog.');
        }
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', icon_url: '', badge_type: 'course_completion', points: 0 });
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(`Failed to save ${activeTab === 'badges' ? 'badge' : 'achievement'}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Badge | Achievement) => {
    setEditingItem(item);
    if (activeTab === 'badges') {
      const badge = item as Badge;
      setFormData({
        name: badge.name,
        description: badge.description || '',
        icon_url: badge.icon_url || '',
        badge_type: badge.badge_type || 'course_completion',
        points: 0,
      });
    } else {
      const achievement = item as Achievement;
      setFormData({
        name: achievement.name,
        description: achievement.description || '',
        icon_url: achievement.icon_url || '',
        badge_type: 'course_completion',
        points: achievement.points || 0,
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      if (activeTab === 'badges') {
        await deleteBadge(id);
        setBadges((prev) => prev.filter((b) => b.id !== id));
        showToast('Badge removed', 'Badge deleted from catalog.');
      } else {
        await deleteAchievement(id);
        setAchievements((prev) => prev.filter((a) => a.id !== id));
        showToast('Achievement removed', 'Achievement deleted from catalog.');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(`Failed to delete ${activeTab === 'badges' ? 'badge' : 'achievement'}.`);
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-primary/15 via-background-card to-background shadow-lg shadow-primary/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">Recognition system</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Badges & Achievements</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Create badges and achievements to recognize learner accomplishments and motivate engagement.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">{activeTab === 'badges' ? 'Badges' : 'Achievements'}</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.total}</p>
            </div>
            {activeTab === 'badges' ? (
              <Medal size={20} className="text-primary" />
            ) : (
              <Trophy size={20} className="text-yellow-500" />
            )}
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Earned</p>
              <p className="text-2xl font-semibold text-text-primary">{summary.earned}</p>
            </div>
            <Users size={20} className="text-emerald-500" />
          </div>
          {activeTab === 'achievements' && (
            <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
              <div>
                <p className="text-xs uppercase text-text-muted">Total points</p>
                <p className="text-2xl font-semibold text-text-primary">{summary.totalPoints}</p>
              </div>
              <Star size={20} className="text-yellow-400" />
            </div>
          )}
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 border-b border-secondary/20 pb-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('badges');
                setSearch('');
                setEditingItem(null);
                setConfirmDelete(null);
              }}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                activeTab === 'badges'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary/10'
              }`}
            >
              <Medal size={16} className="inline mr-2" />
              Badges
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('achievements');
                setSearch('');
                setEditingItem(null);
                setConfirmDelete(null);
              }}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                activeTab === 'achievements'
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-secondary/10'
              }`}
            >
              <Trophy size={16} className="inline mr-2" />
              Achievements
            </button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: '',
                  description: '',
                  icon_url: '',
                  badge_type: 'course_completion',
                  points: 0,
                });
                setShowModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition whitespace-nowrap"
            >
              <Plus size={18} />
              Add {activeTab === 'badges' ? 'Badge' : 'Achievement'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading {activeTab}...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No {activeTab} defined</p>
          <p className="text-sm text-text-muted">Create {activeTab === 'badges' ? 'badges' : 'achievements'} to recognize learner accomplishments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-secondary/10 hover:border-primary transition relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {item.icon_url ? (
                      <img src={item.icon_url} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        {activeTab === 'badges' ? (
                          <Medal size={24} className="text-primary" />
                        ) : (
                          <Trophy size={24} className="text-yellow-500" />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-xs uppercase text-text-muted">{activeTab === 'badges' ? 'Badge' : 'Achievement'}</p>
                      <h2 className="text-lg font-semibold text-text-primary">{item.name}</h2>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-full border border-secondary/30 p-2 text-primary hover:border-primary"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(item)}
                      className="rounded-full border border-secondary/30 p-2 text-red-400 hover:border-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {item.description && <p className="text-sm text-text-muted mb-4">{item.description}</p>}
                <div className="flex items-center gap-4 text-[11px] text-text-muted">
                  <span>
                    <Users size={11} className="inline mr-1" />
                    {item.users_count ?? 0} earned
                  </span>
                  {activeTab === 'badges' && (item as Badge).badge_type && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-text-muted">
                      {(item as Badge).badge_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {activeTab === 'achievements' && (item as Achievement).points > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                      +{(item as Achievement).points} pts
                    </span>
                  )}
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
              {editingItem ? `Edit ${activeTab === 'badges' ? 'Badge' : 'Achievement'}` : `Create ${activeTab === 'badges' ? 'Badge' : 'Achievement'}`}
            </h2>
            <p className="text-xs text-text-muted">
              {activeTab === 'badges'
                ? 'Define a badge that learners can earn by completing specific actions.'
                : 'Define an achievement that awards points and recognizes milestones.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder={`e.g., ${activeTab === 'badges' ? 'First Course Completed' : 'Perfect Score Master'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  rows={3}
                  placeholder="What does this recognize?"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Icon URL (optional)</label>
                <input
                  type="text"
                  value={formData.icon_url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon_url: e.target.value }))}
                  className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  placeholder="https://example.com/icon.png"
                />
              </div>
              {activeTab === 'badges' && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Badge Type</label>
                  <select
                    value={formData.badge_type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge_type: e.target.value }))}
                    className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                  >
                    <option value="course_completion">Course Completion</option>
                    <option value="quiz_master">Quiz Master</option>
                    <option value="perfect_score">Perfect Score</option>
                    <option value="early_bird">Early Bird</option>
                    <option value="streak">Streak</option>
                    <option value="social">Social</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}
              {activeTab === 'achievements' && (
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase mb-1">Points Awarded</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.points}
                    onChange={(e) => setFormData((prev) => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({ name: '', description: '', icon_url: '', badge_type: 'course_completion', points: 0 });
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
                  {saving ? 'Saving…' : editingItem ? `Update ${activeTab === 'badges' ? 'Badge' : 'Achievement'}` : `Create ${activeTab === 'badges' ? 'Badge' : 'Achievement'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
          <div className="bg-background-card rounded-3xl p-6 w-full max-w-md border border-secondary/30 shadow-2xl shadow-secondary/20">
            <h3 className="text-2xl font-semibold text-text-primary">Delete {activeTab === 'badges' ? 'Badge' : 'Achievement'}?</h3>
            <p className="text-sm text-text-muted mt-2">
              This removes <span className="font-semibold">{confirmDelete.name}</span> from the catalog. Existing user
              {activeTab === 'badges' ? ' badge' : ' achievement'} records will be cleared.
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

