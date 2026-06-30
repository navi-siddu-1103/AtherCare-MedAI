import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Shield, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(!!loggedIn);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-gradient-medical rounded-2xl shadow-medical">
              <Heart className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to <span className="bg-gradient-medical bg-clip-text text-transparent">MediConnect AI</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            MediConnect AI is a unified healthcare platform that helps users instantly locate nearby hospitals, 
            upload skin images for AI-powered disease detection, analyze blood reports with intelligent explanations, 
            and get real-time answers through a chatbot. It simplifies healthcare access, empowers patients with 
            clear insights, and accelerates the path to treatment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Button 
                variant="medical" 
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="shadow-medical hover:shadow-hover-medical text-lg px-8 py-6"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                variant="medical" 
                size="lg"
                onClick={() => navigate('/login')}
                className="shadow-medical hover:shadow-hover-medical text-lg px-8 py-6"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Features Section - Only show after login */}
        {isLoggedIn && (
          <div className="mt-24">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why MediConnect AI?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg bg-gradient-card border border-medical-border shadow-card-medical">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-medical rounded-full">
                    <Brain className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">AI-Driven Insights</h3>
                <p className="text-muted-foreground">
                  Leverage advanced AI to analyze health data and provide personalized recommendations.
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-card border border-medical-border shadow-card-medical">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-medical rounded-full">
                    <Heart className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Real-Time Monitoring</h3>
                <p className="text-muted-foreground">
                  Stay connected with real-time health updates and alerts for proactive care.
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-card border border-medical-border shadow-card-medical">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-medical rounded-full">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Seamless Integration</h3>
                <p className="text-muted-foreground">
                  Integrate with wearable devices and medical records for a unified health experience.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
