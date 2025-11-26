'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Pin, Lock, Plus, Send, Filter, Loader2 } from 'lucide-react';
import { getThreadsByCourse, createThread, createPost, deleteThread, ForumThread } from '@/lib/api/forums';
import { getCourses } from '@/lib/api/courses';
import toast from 'react-hot-toast';

interface Course {
  id: string;
  title: string;
}

export default function ForumsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>('all');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    const fetchCoursesAndThreads = async () => {
      try {
        const data = await getCourses({ limit: 50, offset: 0 });
        const list = Array.isArray(data.courses) ? data.courses : [];
        setCourses(list.map((c: any) => ({ id: c.id, title: c.title })));
        if (list[0]) {
          setSelectedCourseId(list[0].id);
          await loadThreads(list[0].id);
        }
      } catch (error) {
        console.error('Error loading forums:', error);
        toast.error('Unable to load forums.');
      }
    };
    fetchCoursesAndThreads();
  }, []);

  const loadThreads = async (courseId: string) => {
    try {
      setLoadingThreads(true);
      const data = await getThreadsByCourse(courseId);
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching threads:', error);
      toast.error('Unable to load discussions for this course.');
    } finally {
      setLoadingThreads(false);
    }
  };

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

  const handleCreateThread = async () => {
    if (!newThread.title.trim() || !newThread.content.trim() || selectedCourseId === 'all') {
      toast.error('Add a title, message, and select a course.');
      return;
    }
    setCreating(true);
    try {
      const thread = await createThread({
        course_id: selectedCourseId,
        title: newThread.title.trim(),
        content: newThread.content.trim(),
      });
      setThreads((prev) => [thread, ...prev]);
      setNewThread({ title: '', content: '' });
      showToast('Thread created', 'Your topic is now visible to learners.');
    } catch (error) {
      console.error('Error creating thread:', error);
      toast.error('Unable to create thread.');
    } finally {
      setCreating(false);
    }
  };

  const handleAddReply = async () => {
    if (!activeThreadId || !newReply.trim()) return;
    try {
      await createPost(activeThreadId, newReply.trim());
      setNewReply('');
      // optimistic bump reply count in list
      setThreads((prev) =>
        prev.map((t) => (t.id === activeThreadId ? { ...t, reply_count: (t.reply_count || 0) + 1 } : t))
      );
      showToast('Reply posted', 'Your response has been added.');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Unable to add reply.');
    }
  };

  const handleDeleteThread = async (id: string) => {
    try {
      await deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeThreadId === id) setActiveThreadId(null);
      showToast('Thread removed', 'Discussion has been archived.');
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error('Unable to remove thread.');
    }
  };

  const selectedThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-secondary/30 bg-gradient-to-br from-secondary/20 via-background-card to-background shadow-lg shadow-secondary/20 p-6 lg:p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-secondary font-semibold">Community</p>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">Forums</h1>
            </div>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            Course discussions where learners ask questions, share insights, and help each other grow.
          </p>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Open threads</p>
              <p className="text-2xl font-semibold text-text-primary">{threads.length}</p>
            </div>
            <Filter size={18} className="text-secondary" />
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center justify-between shadow-lg shadow-secondary/10">
            <div>
              <p className="text-xs uppercase text-text-muted">Active course</p>
              <p className="text-sm font-semibold text-text-primary">
                {selectedCourseId === 'all'
                  ? 'All courses'
                  : courses.find((c) => c.id === selectedCourseId)?.title || 'Select a course'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
        {/* Thread list & composer */}
        <section className="rounded-3xl border border-secondary/30 bg-background-card p-4 lg:p-5 shadow-lg shadow-primary/5 flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <select
              value={selectedCourseId}
              onChange={async (e) => {
                const value = e.target.value;
                setSelectedCourseId(value as any);
                if (value !== 'all') {
                  setActiveThreadId(null);
                  await loadThreads(value);
                }
              }}
              className="rounded-xl border border-secondary/30 bg-background px-3 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none w-full lg:w-64"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-secondary/20 pt-4 space-y-3">
            <p className="text-xs uppercase text-text-muted">Start a new topic</p>
            <input
              type="text"
              placeholder="Question title"
              value={newThread.title}
              onChange={(e) => setNewThread((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
            />
            <textarea
              placeholder="Give context, share links, or describe the challenge…"
              value={newThread.content}
              onChange={(e) => setNewThread((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCreateThread}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {creating ? 'Posting…' : 'Post thread'}
              </button>
            </div>
          </div>

          <div className="border-t border-secondary/20 pt-4 space-y-3 flex-1 min-h-[200px]">
            <p className="text-xs uppercase text-text-muted">Threads</p>
            {loadingThreads ? (
              <div className="flex items-center justify-center py-8 text-text-muted text-sm">
                <Loader2 size={18} className="mr-2 animate-spin" />
                Loading threads…
              </div>
            ) : threads.length === 0 ? (
              <div className="text-sm text-text-muted py-6 text-center">
                No discussions yet. Be the first to start a conversation for this course.
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 text-sm transition flex items-start justify-between gap-3 ${
                      activeThreadId === thread.id
                        ? 'border-primary bg-primary/5'
                        : 'border-secondary/30 hover:border-primary/60 hover:bg-secondary/5'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {thread.is_pinned && <Pin size={14} className="text-amber-500" />}
                        <span className="font-semibold text-text-primary line-clamp-1">{thread.title}</span>
                      </div>
                      <span className="text-xs text-text-muted line-clamp-2">{thread.content}</span>
                      <span className="text-[10px] text-text-muted/80">
                        {thread.reply_count || 0} replies ·{' '}
                        {thread.last_reply_at ? new Date(thread.last_reply_at).toLocaleDateString() : 'no replies yet'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {thread.is_locked && <Lock size={14} className="text-red-400" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThread(thread.id);
                        }}
                        className="text-[11px] text-text-muted hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Thread detail / quick reply */}
        <section className="rounded-3xl border border-secondary/30 bg-background-card p-4 lg:p-6 shadow-lg shadow-primary/5 flex flex-col gap-4 min-h-[260px]">
          {selectedThread ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase text-text-muted">Selected thread</p>
                  <h2 className="text-lg font-semibold text-text-primary mt-1">{selectedThread.title}</h2>
                  <p className="text-xs text-text-muted mt-1">
                    {selectedThread.first_name} {selectedThread.last_name} ·{' '}
                    {new Date(selectedThread.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedThread.is_locked && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-500/10 px-3 py-1 text-[11px] text-red-400">
                    <Lock size={12} />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted">{selectedThread.content}</p>
              {!selectedThread.is_locked && (
                <div className="mt-auto border-t border-secondary/20 pt-4 space-y-3">
                  <p className="text-xs uppercase text-text-muted">Quick reply</p>
                  <div className="flex gap-2">
                    <textarea
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Share an answer, example, or follow-up…"
                      rows={3}
                      className="flex-1 rounded-xl border border-secondary/30 bg-background px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddReply}
                      className="self-end inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
                    >
                      <Send size={14} />
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center gap-2">
              <MessageSquare size={32} className="text-secondary" />
              <p className="text-sm font-semibold text-text-primary">Select a thread to view details</p>
              <p className="text-xs text-text-muted">Pick a discussion on the left or create a new topic.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


