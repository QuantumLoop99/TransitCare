import React from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, LogOut, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface HeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  const { user: clerkUser } = useClerkUser();

  const linkClass =
    'px-3 py-2 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors';

  const handleSignOut = () => {
    onSignOut?.();
    navigate('/');
  };

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'officer':
        return '/transport/dashboard';
      default:
        return '/passenger/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={user ? getDashboardLink(user.role) : '/'}
            className="flex items-center space-x-2 text-xl font-bold text-blue-600 hover:text-blue-700"
          >
            <Bus className="w-8 h-8" />
            <span>TransitCare</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to={getDashboardLink(user.role)} className={linkClass}>
                  Dashboard
                </Link>
                {user.role === 'passenger' && (
                  <>
                    <Link to="/passenger/complaints" className={linkClass}>
                      My Complaints
                    </Link>
                    <Link to="/passenger/complaints/new" className={linkClass}>
                      New Complaint
                    </Link>
                    <Link to="/passenger/notifications" className={linkClass}>
                      Notifications
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin/complaints" className={linkClass}>
                      Complaints
                    </Link>
                    <Link to="/admin/users" className={linkClass}>
                      Users
                    </Link>
                    <Link to="/admin/reports" className={linkClass}>
                      Reports
                    </Link>
                    <Link to="/admin/settings" className={linkClass}>
                      Settings
                    </Link>
                  </>
                )}
                {user.role === 'officer' && (
                  <>
                    <Link to="/transport/complaints" className={linkClass}>
                      Assigned Complaints
                    </Link>
                    <Link to="/transport/complaints/history" className={linkClass}>
                      History
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
                <Link to="/about" className={linkClass}>
                  About
                </Link>
                <Link to="/contact" className={linkClass}>
                  Contact
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center">
                    {clerkUser?.imageUrl ? (
                      <img
                        src={clerkUser.imageUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName || user.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/sign-in">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};