import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { PassengerDashboard } from './pages/passenger/PassengerDashboard';
import { NewComplaint } from './pages/passenger/NewComplaint';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Mock user data - in real app this would come from auth context
const mockUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'passenger' as 'passenger' | 'admin' | 'officer',
};

function App() {
  const [user, setUser] = React.useState<typeof mockUser | null>(mockUser);

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user ? (
          <Layout user={user} onSignOut={handleSignOut}>
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
                      user.role === 'admin' 
                        ? '/admin/dashboard' 
                        : user.role === 'officer'
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