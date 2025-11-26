import { User, Bell } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
}

export default function Header({ userName, userRole, userAvatar }: HeaderProps) {
  const location = useLocation();
  const pathname = location.pathname;
  
  const getPageTitle = () => {
    if (pathname?.includes('/admin')) {
      if (pathname.includes('/users')) return 'Users';
      if (pathname.includes('/departments')) return 'Departments';
      if (pathname.includes('/categories')) return 'Categories';
      if (pathname.includes('/courses')) return 'Courses';
      if (pathname.includes('/analytics')) return 'Analytics';
      if (pathname.includes('/settings')) return 'Settings';
      return 'Admin Dashboard';
    }
    if (pathname?.includes('/instructor')) {
      return 'Instructor Dashboard';
    }
    if (pathname?.includes('/student')) {
      return 'Student Dashboard';
    }
    if (pathname?.includes('/courses')) {
      return 'Courses';
    }
    return 'Dashboard';
  };

  const getRoleDisplay = (role?: string) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="h-16 bg-background-card border-b border-secondary/30 flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <button className="relative p-2 rounded-lg hover:bg-secondary/10 transition-colors">
          <Bell size={20} className="text-text-primary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-secondary/30">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || 'User'}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center border-2 border-primary/30">
              <User size={20} className="text-text-primary" />
            </div>
          )}
          <div className="text-right">
            <p className="text-sm font-medium text-text-primary">
              {userName || 'User'}
            </p>
            <p className="text-xs text-text-muted">{getRoleDisplay(userRole)}</p>
          </div>
        </div>
      </div>
    </header>
  );
}


