import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Users, BarChart3, Shield, Clock, CheckCircle } from "lucide-react";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import Bus1 from "../assets/BG.jpg";
import Bus2 from "../assets/BG1.jpg";
import Bus3 from "../assets/BG2.jpg";
import Bus4 from "../assets/BG3.png";
import Passenger from "../assets/passenger.jpg";
import Officer from "../assets/officer.jpg";
import Admin from "../assets/admin.jpg";


export const LandingPage: React.FC = () => {
  const images = [Bus1, Bus2, Bus3, Bus4];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Features data (unchanged)
  const features = [
    { icon: Zap, title: "AI-Powered Prioritization", description: "Automatic complaint prioritization using advanced AI to ensure urgent issues get immediate attention." },
    { icon: Users, title: "Role-Based Access", description: "Separate dashboards for passengers, transport officers, and administrators with appropriate permissions." },
    { icon: BarChart3, title: "Comprehensive Analytics", description: "Detailed reports and analytics to track complaint trends and resolution performance." },
    { icon: Shield, title: "Secure & Reliable", description: "Enterprise-grade security with data encryption and reliable cloud infrastructure." },
    { icon: Clock, title: "Real-time Updates", description: "Get instant notifications about complaint status changes and resolution updates." },
    { icon: CheckCircle, title: "Easy Resolution", description: "Streamlined workflow for transport officers to efficiently resolve complaints." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

    {/* Hero Section */}
    <div className="relative overflow-hidden h-[600px]">
      {/* Sliding Images */}
      <div
        className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
          ></div>
        ))}
      </div>

      {/* Fixed overlay for text */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div> {/* optional overlay */}

      {/* Text stays fixed */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Transform Public Transport
          <span className="block text-blue-400">Complaint Management</span>
        </h1><br/>
        <p className="text-xl text-gray-100 max-w-3xl mb-6">
          Streamline complaint processing with AI-powered prioritization, real-time tracking,and comprehensive analytics. Built for passengers, officers, and administrators.
        </p><br/>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth/sign-up">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Effective Complaint Management
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools needed to manage public transport 
              complaints efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple steps to better complaint management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit Complaint</h3>
              <p className="text-gray-600">Passengers easily submit complaints through our intuitive form with all necessary details.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Prioritization</h3>
              <p className="text-gray-600">Our AI system automatically analyzes and prioritizes complaints based on urgency and impact.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Resolution</h3>
              <p className="text-gray-600">Transport officers receive assignments and work efficiently to resolve issues with real-time updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Hear from real users who have improved their complaint management with TransitCare.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-md border-blue-100 border-2">
              <CardContent className="p-6 flex flex-col items-center">
                <div>
                    <img src={Passenger} alt="Background" className="w-16 h-16 rounded-full flex items-center justify-center mb-4"/>
                </div>
                <p className="text-gray-700 italic mb-2">“Submitting complaints is so easy and I always know the status. The updates are instant!”</p><br/>
                <span className="text-sm text-gray-500">- Mr.Perera, Passenger</span>
              </CardContent>
            </Card>
            <Card className="shadow-md border-indigo-100 border-2">
              <CardContent className="p-6 flex flex-col items-center">
                <div>
                    <img src={Officer} alt="Background" className="w-16 h-16 rounded-full flex items-center justify-center mb-4"/>
                </div>
                <p className="text-gray-700 italic mb-2">“The AI prioritization helps me focus on the most urgent issues. My workflow is much smoother.”</p><br/>
                <span className="text-sm text-gray-500">- Mrs.Kasuni, Transport Officer</span>
              </CardContent>
            </Card>
            <Card className="shadow-md border-green-100 border-2">
              <CardContent className="p-6 flex flex-col items-center">
                <div>
                    <img src={Admin} alt="Background" className="w-16 h-16 rounded-full flex items-center justify-center mb-4"/>
                </div>
                <p className="text-gray-700 italic mb-2">“Analytics and reports give us the insights we need to improve our services.”</p><br/>
                <span className="text-sm text-gray-500">- Mr.Dasanayake, Administrator</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Complaint Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of transport authorities already using TransitCare to improve their services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto border-white">
                Get Started 
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto border-white">
                Contact Us       
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};