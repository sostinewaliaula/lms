'use client';

import { useState } from 'react';
import { Paintbrush, Bell, Shield, MonitorSmartphone, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  const [branding, setBranding] = useState({
    productName: 'Knowledge Center',
    subtitle: 'TQ Academy',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyDigest: true,
    requireStrongPasswords: true,
    autoEnrollNewHires: false,
  });

  const showToast = (title: string, message: string) => {
    toast.custom(
      <div className="relative min-w-[260px] rounded-3xl border bg-background shadow-lg shadow-black/10 dark:shadow-black/40 px-5 py-4">
        <div className="absolute inset-0 rounded-3xl border border-white/40 dark:border-white/10 pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background text-green-500 border-green-200 dark:border-green-500/40">
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

  const handleSaveBranding = async () => {
    setSavingBranding(true);
    try {
      // Placeholder for future API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Branding updated', 'Your changes are now reflected across the dashboard.');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      // Placeholder for future API call
      await new Promise((resolve) => setTimeout(resolve, 600));
      showToast('Settings saved', 'Notification and security preferences have been updated.');
    } finally {
      setSavingPreferences(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/15 via-secondary/10 to-background-card shadow-[0_25px_70px_rgba(15,118,110,0.25)] p-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-primary font-semibold">Control center</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">Admin settings</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Fine-tune how the Knowledge Center looks and behaves for everyone. Branding, notifications, and security
              live here.
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center gap-3 shadow-lg shadow-secondary/10">
            <Paintbrush size={20} className="text-primary" />
            <div>
              <p className="text-xs uppercase text-text-muted">Theme</p>
              <p className="text-sm font-semibold text-text-primary">Branding & layout</p>
            </div>
          </div>
          <div className="rounded-3xl border border-secondary/30 bg-background-card p-4 flex items-center gap-3 shadow-lg shadow-secondary/10">
            <Bell size={20} className="text-secondary" />
            <div>
              <p className="text-xs uppercase text-text-muted">Delivery</p>
              <p className="text-sm font-semibold text-text-primary">Email & in-app alerts</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Branding */}
        <section className="rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-primary/5 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MonitorSmartphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Branding</h2>
              <p className="text-xs text-text-muted">Update the name and subtitle shown across the app.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Product name
              </label>
              <input
                type="text"
                value={branding.productName}
                onChange={(e) => setBranding((prev) => ({ ...prev, productName: e.target.value }))}
                className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={branding.subtitle}
                onChange={(e) => setBranding((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full rounded-xl border border-secondary/30 bg-background px-4 py-2.5 text-sm text-text-primary focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted uppercase mb-2">
                Logo (coming soon)
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-secondary/40 bg-background px-4 py-2.5 text-xs font-medium text-text-muted"
              >
                <UploadCloud size={16} />
                Upload logo
              </button>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveBranding}
              disabled={savingBranding}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
            >
              {savingBranding ? 'Saving…' : 'Save branding'}
            </button>
          </div>
        </section>

        {/* Notifications & security */}
        <section className="rounded-3xl border border-secondary/30 bg-background-card p-6 shadow-lg shadow-primary/5 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Notifications & security</h2>
              <p className="text-xs text-text-muted">
                Configure how admins and learners are notified and keep access secure.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-secondary/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Email notifications</p>
                <p className="text-xs text-text-muted">Send updates for new courses and enrollments.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.emailNotifications ? 'bg-primary' : 'bg-secondary/40'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
                    preferences.emailNotifications ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-secondary/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Weekly digest</p>
                <p className="text-xs text-text-muted">Summary of activity for managers and admins.</p>
              </div>
              <button
                type="button"
                onClick={() => setPreferences((prev) => ({ ...prev, weeklyDigest: !prev.weeklyDigest }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.weeklyDigest ? 'bg-primary' : 'bg-secondary/40'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
                    preferences.weeklyDigest ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-secondary/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Strong passwords</p>
                <p className="text-xs text-text-muted">
                  Require at least 8 characters, numbers, and special symbols.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({
                    ...prev,
                    requireStrongPasswords: !prev.requireStrongPasswords,
                  }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.requireStrongPasswords ? 'bg-primary' : 'bg-secondary/40'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
                    preferences.requireStrongPasswords ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-secondary/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">Auto-enroll new hires</p>
                <p className="text-xs text-text-muted">
                  Automatically add new employees to onboarding paths. (Coming soon)
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, autoEnrollNewHires: !prev.autoEnrollNewHires }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  preferences.autoEnrollNewHires ? 'bg-primary' : 'bg-secondary/40'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-background transition ${
                    preferences.autoEnrollNewHires ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-60"
            >
              {savingPreferences ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


