import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Header } from '../../components/layout/Header';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About TransitCare
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Revolutionizing public transportation complaint management with AI-powered solutions
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            TransitCare is dedicated to improving public transportation services by providing a 
            seamless platform for passengers to voice their concerns and for transport services 
            to efficiently address them. We leverage cutting-edge AI technology to prioritize 
            complaints, analyze sentiment, and ensure faster resolution times.
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Our goal is to create a safer, more reliable, and passenger-friendly public 
            transportation ecosystem for everyone.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              AI-Powered Prioritization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Our advanced AI analyzes complaints and automatically assigns priority levels 
              based on severity, sentiment, and urgency.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Real-Time Communication
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Direct messaging between passengers and transport representatives ensures 
              transparent and efficient complaint resolution.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Comprehensive Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed reports and insights help administrators identify patterns and 
              improve service quality across the network.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Submit Complaint
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Passengers register and submit complaints with details, evidence, and location information.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our AI engine analyzes the complaint, assigns priority, and categorizes it for efficient handling.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Assignment & Resolution
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complaints are assigned to relevant transport services who work to resolve issues quickly.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Feedback & Closure
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Passengers provide feedback on resolution, helping improve service quality over time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of passengers making public transportation better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="w-full sm:w-auto border-white"
              onClick={() => navigate('/auth/sign-up')}>
              Get Started
            </Button>
            <Button size="lg" className="w-full sm:w-auto border-white"
              onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-200 dark:bg-gray-800 shadow-md mt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2025 TransitCare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
