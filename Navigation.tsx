import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { GraduationCap, LayoutDashboard, MessageSquare, LogOut } from 'lucide-react';

interface NavigationProps {
  user: any;
  onLogout: () => void;
}

export default function Navigation({ user, onLogout }: NavigationProps) {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl text-gray-900">SnapSyllabus</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'secondary' : 'ghost'}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/chat">
                <Button 
                  variant={isActive('/chat') ? 'secondary' : 'ghost'}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </Button>
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <div className="text-sm text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t px-4 py-2 flex gap-2">
        <Link to="/" className="flex-1">
          <Button 
            variant={isActive('/') ? 'secondary' : 'ghost'}
            className="w-full gap-2"
            size="sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <Link to="/chat" className="flex-1">
          <Button 
            variant={isActive('/chat') ? 'secondary' : 'ghost'}
            className="w-full gap-2"
            size="sm"
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </Button>
        </Link>
      </div>
    </nav>
  );
}
