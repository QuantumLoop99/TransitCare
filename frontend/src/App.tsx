import { useEffect, useState } from 'react';
import { SignIn, SignUp, useUser, useAuth } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { fetchOnboardUser } from './lib/onboard';

// Configure React Router future flags
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

// Public Pages
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Passenger Pages
import { PassengerDashboard } from './pages/passenger/Passengerdashboard';
import { Profile } from './pages/passenger/Profile';
import { NewComplaint } from './pages/passenger/NewComplaint';
import { MyComplaints } from './pages/passenger/MyComplaints';
import { ComplaintDetails } from './pages/passenger/ComplaintDetails';
import { Notifications } from './pages/passenger/Notifications';

// Transport Representative Pages
import { TransportDashboard } from './pages/transport/TransportDashboard';
import { AssignedComplaints } from './pages/transport/AssignedComplaints';
import { TransportComplaintDetails } from './pages/transport/TransportComplaintDetails';
import { ComplaintHistory } from './pages/transport/ComplaintHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AddEditUser } from './pages/admin/AddEditUser';
import { ComplaintManagement } from './pages/admin/ComplaintManagement';
import { PriorityRulesManagement } from './pages/admin/PriorityRulesManagement';
import { AddEditPriorityRule } from './pages/admin/AddEditPriorityRule';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { SystemSettings } from './pages/admin/SystemSettings';
import { OfficerAssignment } from './pages/admin/OfficerAssignment';

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
        setOnboardError(`Failed to load profile. Please try again or contact support if the issue persists.`);
        
        // Use a default passenger role as fallback if backend fails
        setLocalUser({
          _id: 'temp-' + user.id,
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: 'passenger', // Changed from 'passenger' to 'transport' for testing
          clerkId: user.id
        });
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
    <Router future={routerFutureConfig}>
      <div className="min-h-screen bg-gray-50">
        {isSignedIn ? (
          // If signed in but still fetching local user, show landing or a loader
          localUser ? (
            <Layout user={localUser} onSignOut={handleSignOut}>
              <Routes>
                {/* Passenger Routes */}
                <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
                <Route path="/passenger/complaints/new" element={<NewComplaint />} />
                <Route path="/passenger/complaints" element={<MyComplaints />} />
                <Route path="/passenger/complaints/:id" element={<ComplaintDetails />} />
                <Route path="/passenger/notifications" element={<Notifications />} />
                <Route path="/passenger/profile" element={<Profile />} />

                {/* Transport Representative Routes */}
                <Route path="/transport/dashboard" element={<TransportDashboard />} />
                <Route path="/transport/complaints" element={<AssignedComplaints />} />
                <Route path="/transport/complaints/:id" element={<TransportComplaintDetails />} />
                <Route path="/transport/complaints/history" element={<ComplaintHistory />} />
                <Route path="/transport/profile" element={<Profile />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/users/add" element={<AddEditUser />} />
                <Route path="/admin/users/edit/:id" element={<AddEditUser />} />
                <Route path="/admin/complaints" element={<ComplaintManagement />} />
                <Route path="/admin/complaints/:id" element={<ComplaintDetails />} />
                <Route path="/admin/priority-rules" element={<PriorityRulesManagement />} />
                <Route path="/admin/priority-rules/add" element={<AddEditPriorityRule />} />
                <Route path="/admin/priority-rules/edit/:id" element={<AddEditPriorityRule />} />
                <Route path="/admin/reports" element={<ReportsAnalytics />} />
                <Route path="/admin/settings" element={<SystemSettings />} />
                <Route path="/admin/officers/:complaintId" element={<OfficerAssignment />} />

                {/* Default redirect based on role */}
                <Route
                  path="/"
                  element={
                    <Navigate
                      to={
                        localUser.role === 'admin'
                          ? '/admin/dashboard'
                          : localUser.role === 'officer'
                          ? '/transport/dashboard'
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
              <div className="max-w-md w-full mx-4">
                {onboardError ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="text-yellow-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Connection Issue
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {onboardError}
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Retry Connection
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                      Note: Using temporary session until backend is available
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading user profile...</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
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