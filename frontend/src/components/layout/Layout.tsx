import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    firstName?: string;
    lastName?: string;
    email: string;
    role: string;
  };
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onSignOut }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onSignOut={onSignOut} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};