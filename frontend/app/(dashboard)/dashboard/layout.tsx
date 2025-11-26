'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layouts/Sidebar';
import Header from '@/components/layouts/Header';
import { authApi } from '@/lib/api/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const data = await authApi.getProfile();
        setUser(data.user);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar userRole={user?.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          userName={`${user?.first_name} ${user?.last_name}`}
          userRole={user?.role}
          userAvatar={user?.avatar_url}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}


