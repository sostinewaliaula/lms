'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
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
          router.push('/dashboard/admin');
          break;
        case 'instructor':
          router.push('/dashboard/instructor');
          break;
        case 'student':
        default:
          router.push('/dashboard/student');
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-background-card dark:bg-background-card rounded-lg p-8 shadow-lg border border-secondary/30">
          <div className="flex flex-col items-center mb-6">
            <img 
              src="/assets/logo.png" 
              alt="Caava Group Logo" 
              className="w-48 h-48 object-contain mb-3"
            />
            <div className="text-center mb-4">
              <h1 className="text-5xl font-bold mb-2">
                <span className="text-primary">Caava</span>{' '}
                <span className="text-secondary">Group</span>
              </h1>
              <p className="text-xl text-text-muted">Learning Management System</p>
            </div>
            <h2 className="text-3xl font-semibold text-text-primary mb-1">Welcome Back</h2>
            <p className="text-lg text-text-muted">Sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-background-dark border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-background-dark border border-secondary/30 rounded-lg text-text-primary focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-text-muted">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

