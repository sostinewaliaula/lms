'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Star,
  BookOpen,
  Search,
  RefreshCw,
  Crown,
  TrendingUp,
} from 'lucide-react';
import {
  getLeaderboard,
  getLeaderboardStats,
  recalculateRanks,
  LeaderboardEntry,
  LeaderboardStats,
} from '@/lib/api/leaderboard';
import toast from 'react-hot-toast';

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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
      const [leaderboardData, statsData] = await Promise.all([
        getLeaderboard(),
        getLeaderboardStats(),
      ]);
      setEntries(Array.isArray(leaderboardData) ? leaderboardData : []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Unable to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      await recalculateRanks();
      showToast('Ranks recalculated', 'Leaderboard rankings have been updated.');
      fetchData();
    } catch (error) {
      console.error('Error recalculating ranks:', error);
      toast.error('Failed to recalculate ranks.');
    } finally {
      setRecalculating(false);
    }
  };

  const filteredEntries = useMemo(() => {
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.user_name?.toLowerCase().includes(q) ||
        e.user_email?.toLowerCase().includes(q)
    );
  }, [entries, search]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal size={20} className="text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Award size={20} className="text-amber-600 fill-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/20 text-gray-600 dark:text-gray-400 border-gray-400/30';
    if (rank === 3) return 'bg-amber-600/20 text-amber-700 dark:text-amber-500 border-amber-600/30';
    return 'bg-secondary/20 text-text-muted border-secondary/30';
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-yellow-500/15 via-background-card to-background shadow-lg shadow-yellow-500/25 p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-yellow-500 font-semibold">Competition hub</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Leaderboard</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Track learner achievements, points, and rankings to foster healthy competition and engagement.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Participants</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.total_users || 0}</p>
            </div>
            <Trophy size={20} className="text-primary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Top score</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.top_points || 0}</p>
            </div>
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Avg points</p>
              <p className="text-2xl font-semibold text-text-primary">{stats?.average_points || 0}</p>
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
        </div>
      </section>

      <div className="bg-background-card border border-secondary/30 rounded-2xl p-4 lg:p-5 shadow-lg shadow-primary/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-secondary/30 bg-background pl-10 pr-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleRecalculate}
            disabled={recalculating}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm font-semibold text-text-primary shadow-lg shadow-secondary/10 hover:border-primary disabled:opacity-60 transition whitespace-nowrap"
          >
            <RefreshCw size={18} className={recalculating ? 'animate-spin' : ''} />
            {recalculating ? 'Recalculating...' : 'Recalculate Ranks'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading leaderboard...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 bg-background-card border border-secondary/30 rounded-2xl">
          <p className="text-lg font-semibold text-text-primary mb-2">No entries found</p>
          <p className="text-sm text-text-muted">
            {search ? 'Try adjusting your search.' : 'No users have earned points yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.user_id}
              className={`group rounded-3xl border ${
                entry.rank <= 3
                  ? 'border-primary/50 bg-gradient-to-r from-primary/5 to-background-card'
                  : 'border-secondary/30 bg-background-card'
              } p-6 shadow-lg shadow-secondary/10 hover:border-primary transition`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 flex items-center justify-center">
                  {entry.rank <= 3 ? (
                    <div className="flex flex-col items-center">
                      {getRankIcon(entry.rank)}
                      <span className="text-xs font-bold text-text-primary mt-1">#{entry.rank}</span>
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}
                    >
                      <span className="text-lg font-bold">{entry.rank}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {entry.avatar_url ? (
                      <img
                        src={entry.avatar_url}
                        alt={entry.user_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary font-semibold text-lg">
                        {entry.user_name?.charAt(0).toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary truncate">
                      {entry.user_name || 'Unknown User'}
                    </h3>
                    <p className="text-xs text-text-muted truncate">{entry.user_email}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-text-muted">Points</span>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{entry.total_points}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BookOpen size={14} className="text-blue-500" />
                        <span className="text-xs text-text-muted">Courses</span>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{entry.courses_completed}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Award size={14} className="text-purple-500" />
                        <span className="text-xs text-text-muted">Badges</span>
                      </div>
                      <p className="text-lg font-bold text-text-primary">{entry.badges_earned}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="bg-background-card border border-secondary/30 rounded-2xl p-5 shadow-lg shadow-primary/5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Overall Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-xl bg-secondary/10">
              <p className="text-xs text-text-muted mb-1">Total Points</p>
              <p className="text-xl font-bold text-text-primary">
                {entries.reduce((sum, e) => sum + e.total_points, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/10">
              <p className="text-xs text-text-muted mb-1">Courses Completed</p>
              <p className="text-xl font-bold text-text-primary">{stats.total_courses_completed}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/10">
              <p className="text-xs text-text-muted mb-1">Badges Earned</p>
              <p className="text-xl font-bold text-text-primary">{stats.total_badges_earned}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/10">
              <p className="text-xs text-text-muted mb-1">Average Points</p>
              <p className="text-xl font-bold text-text-primary">{stats.average_points}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

