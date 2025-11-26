import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);
      const userRole = response.user?.role || 'student';
      
      // Redirect based on user role
      switch (userRole) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'instructor':
          navigate('/dashboard/instructor');
          break;
        case 'student':
        default:
          navigate('/dashboard/student');
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      {/* subtle background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -right-20 top-10 w-72 h-72 bg-secondary/20 blur-3xl rounded-full"></div>
        <div className="absolute -left-10 bottom-10 w-80 h-80 bg-primary/20 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 flex min-h-screen lg:h-screen flex-col lg:flex-row">
        <div className="flex-1 hidden lg:flex flex-col justify-center px-12 py-8 border-r border-secondary/20 bg-gradient-to-br from-[rgba(16,185,129,0.08)] via-background to-[rgba(139,92,246,0.08)] dark:from-[rgba(16,185,129,0.15)] dark:via-[rgb(10,15,35)] dark:to-[rgba(139,92,246,0.15)] transition-colors">
          <div className="max-w-lg space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/assets/logo.png"
                alt="Knowledge Center Logo"
                className="h-14 w-14 object-contain"
              />
              <div>
                <p className="text-xl font-bold text-primary">Knowledge Center</p>
                <p className="brand-subtitle text-secondary">TQ Academy</p>
              </div>
            </div>
            <h1 className="text-3xl xl:text-4xl font-bold text-text-primary leading-tight">
              Internal learning built for <span className="text-primary">Team TQ</span>
            </h1>
            <p className="text-base text-text-muted">
              Access department programs, learning paths, certifications, and collaboration spaces curated for TQ Academy learners.
            </p>
            <div className="space-y-3">
              {[
                'Role-aware dashboards for admins, instructors, and learners',
                'Progress tracking, certificates, and analytics built-in',
                'Secure enterprise authentication with centralized provisioning',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-text-primary">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary"></span>
                  <p className="text-sm text-text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-4">
          <div className="w-full max-w-md relative bg-background-card bg-opacity-95 border border-primary/20 rounded-[26px] shadow-[0_20px_45px_rgba(16,185,129,0.18)] p-5 sm:p-6 backdrop-blur-xl transition-colors">
            <div className="absolute inset-0 rounded-[26px] pointer-events-none border border-secondary/40"></div>
            <div className="flex flex-col items-center text-center mb-5">
              <img
                src="/assets/logo.png"
                alt="Knowledge Center Logo"
                className="w-16 h-16 object-contain mb-2"
              />
              <p className="text-xs uppercase tracking-[0.35em] text-secondary mb-1">TQ Academy</p>
              <h2 className="text-2xl font-semibold text-text-primary mb-1">Welcome back</h2>
              <p className="text-text-muted text-xs">Sign in with your TQ Academy credentials</p>
            </div>

            {error && (
              <div className="bg-red-500/15 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-surface w-full px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm placeholder:text-text-muted/70"
                  placeholder="you@caava.group"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">
                    Password
                  </label>
                  <button type="button" className="text-[11px] text-primary hover:underline">
                    Need help?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-surface w-full px-3.5 py-2.5 rounded-xl text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm placeholder:text-text-muted/70"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-60 shadow-lg shadow-primary/30"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-xs text-text-muted">
              <p>TQ Academy accounts are provisioned by administrators.</p>
              <p>
                Need access? Contact your department manager or HR to have an account created for you.
              </p>
            </div>

            <div className="mt-5 text-center">
              <Link to="/" className="text-primary text-xs hover:underline">
                Return to Knowledge Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


