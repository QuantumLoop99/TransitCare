export const clerkConfig = {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  appearance: {
    theme: {
      primaryColor: '#3B82F6',
      buttonBackground: '#3B82F6',
    },
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
      card: 'shadow-lg border border-gray-200',
      headerTitle: 'text-xl font-bold text-gray-900',
      headerSubtitle: 'text-gray-600',
    },
  },
};

export const roleBasedRedirect = (role: string) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'officer':
      return '/officer/dashboard';
    case 'passenger':
    default:
      return '/passenger/dashboard';
  }
};