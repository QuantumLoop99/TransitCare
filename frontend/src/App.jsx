import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
  RedirectToSignIn,
  UserButton
} from '@clerk/clerk-react'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Clerk’s built‐in auth pages */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Protected app */}
        <Route
          path="/*"
          element={
            <>
              <SignedIn>
                <header style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>
                  <h1>TransitCare</h1>
                  <UserButton />
                </header>
                <Dashboard />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
