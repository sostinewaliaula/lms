import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToRoleDashboard = async () => {
      try {
        const data = await authApi.getProfile();
        const userRole = data.user?.role || 'student';
        
        // Redirect based on user role
        switch (userRole) {
          case 'admin':
            navigate('/dashboard/admin', { replace: true });
            break;
          case 'instructor':
            navigate('/dashboard/instructor', { replace: true });
            break;
          case 'student':
          default:
            navigate('/dashboard/student', { replace: true });
            break;
        }
      } catch (error) {
        navigate('/login', { replace: true });
      }
    };

    redirectToRoleDashboard();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-primary">Redirecting...</div>
    </div>
  );
}


