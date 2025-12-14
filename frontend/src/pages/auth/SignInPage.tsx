import { SignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import bgImage from '../../assets/BG.jpg';
import Logo from '../../assets/Logo.jpg';

export function SignInPage() {
  return (
    <div className="h-screen flex items-stretch bg-gray-100">
      <div className="flex items-stretch w-full rounded-none shadow-none overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-100" style={{ backgroundImage: `url(${bgImage})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/80 via-blue-600/80 to-blue-800/80"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
              <img src={Logo} alt="TransitCare Logo" className="w-11 h-11 object-contain" />
            </div>
            <span className="text-2xl font-bold">TransitCare</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold">SECURE & RELIABLE</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold leading-tight text-center">
              Empowering cleaner, safer<br />
              transit for everyone.
            </h1>

            <p className="text-blue-100 leading-relaxed text-center">
              Join thousands of commuters helping to improve the public transportation network. <br /> Report issues, track resolutions, and make your voice heard.
            </p>

            {/* Stats */}
            <div className="flex gap-16 pt-8 justify-center">
              <div>
                <div className="text-4xl font-bold">15k+</div>
                <div className="text-blue-200 text-sm mt-1">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98%</div>
                <div className="text-blue-200 text-sm mt-1">Resolution Rate</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-blue-200 text-sm text-center">
            © 2025 TransitCare. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-lg border border-gray-200 bg-white",
                headerTitle: "text-2xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600 mt-2",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                formButtonPrimary: "bg-gray-900 hover:bg-gray-800 text-white font-medium py-3",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                identityPreviewText: "text-gray-700",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                formFieldLabel: "text-gray-700 font-medium",
                formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                dividerLine: "bg-gray-300",
                dividerText: "text-gray-500",
                footer: "hidden",
              },
            }}
            signUpUrl="/auth/sign-up"
          />
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/sign-up" className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
