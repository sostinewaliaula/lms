'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        const data = await authApi.getProfile();
        const userRole = data.user?.role || 'student';
        
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            router.replace('/dashboard/admin');
            break;
          case 'instructor':
            router.replace('/dashboard/instructor');
            break;
          case 'student':
          default:
            router.replace('/dashboard/student');
            break;
        }
      } catch (error) {
        router.push('/login');
      }
    };

    redirectToRoleDashboard();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-primary">Redirecting...</div>
    </div>
  );
}
