'use client';

import { User, Bell } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header({ userName, userRole, userAvatar }: { 
  userName?: string; 
  userRole?: string;
  userAvatar?: string;
}) {
  const getRoleDisplay = (role?: string) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header className="h-16 bg-background-card border-b border-secondary/30 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <img 
          src="/assets/logo.png" 
          alt="Caava Group Logo" 
          className="w-20 h-20 object-contain"
        />
        <div>
          <h2 className="text-xl font-bold">
            <span className="text-primary">Caava</span>{' '}
            <span className="text-secondary">Group</span>
          </h2>
          <p className="text-xs text-text-muted">Dashboard</p>
        </div>
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
