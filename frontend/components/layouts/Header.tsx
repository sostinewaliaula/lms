'use client';

import { Bell, Sun, Moon, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header({ userName, userRole }: { userName?: string; userRole?: string }) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <header className="bg-background-card border-b border-secondary/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-primary">Learning Management System</h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg hover:bg-background-dark transition-colors"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button className="relative p-2 rounded-lg hover:bg-background-dark transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{userName || 'User'}</p>
              <p className="text-xs text-text-muted">{userRole || 'Student'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


