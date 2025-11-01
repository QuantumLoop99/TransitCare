import React, { useEffect, useState } from 'react';
import { SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';
import { NewComplaint } from './pages/passenger/NewComplaint';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { fetchOnboardUser } from './lib/onboard';

type LocalUser = {
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'passenger' | 'admin' | 'officer';
  clerkId?: string;
};

function App() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);

  useEffect(() => {
    // When Clerk reports a signed-in user, call backend to onboard (upsert) and fetch local role
    async function onboard() {
      if (!isSignedIn || !user) return;
      setLoading(true);
      setOnboardError(null);
      try {
        const payload = {
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        };

        const onboarded = await fetchOnboardUser(payload);
        if (onboarded && onboarded.data) {
          setLocalUser(onboarded.data);
        }
      } catch (err) {
        console.error('Onboard failed', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setOnboardError(`Failed to load profile: ${msg}`);
      } finally {
        setLoading(false);
      }
    }

    onboard();
  }, [isSignedIn, user]);

  const handleSignOut = async () => {
    await signOut();
    setLocalUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isSignedIn ? (
          // If signed in but still fetching local user, show landing or a loader
          localUser ? (
            <Layout user={localUser} onSignOut={handleSignOut}>
              <Routes>
                {/* Passenger Routes */}
                <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
                <Route path="/passenger/complaints/new" element={<NewComplaint />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/* Default redirect based on role */}
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={
                        localUser.role === 'admin'
                          ? '/admin/dashboard'
                          : localUser.role === 'officer'
                          ? '/officer/dashboard'
                          : '/passenger/dashboard'
                      }
                      replace
                    />
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              {onboardError ? (
                <div className="text-center">
                  <p className="text-red-600 mb-4">{onboardError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <p className="text-gray-600">Loading user profile...</p>
              )}
            </div>
          )
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;