import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Activity, Calendar, Camera, HelpCircle, Navigation, MessageCircle, User } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

const FeaturePage = () => {
  const { feature } = useParams();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setIsLoggedIn(true);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const featureData = {
    'medical-history': {
      title: 'Medical History',
      description: 'View and manage your comprehensive health records',
      icon: Activity,
      content: 'Access your complete medical history, including past diagnoses, treatments, medications, and test results. Our AI-powered system helps organize and analyze your health data for better insights.',
      features: [
        'Complete health record timeline',
        'AI-powered health insights',
        'Medication tracking',
        'Test results analysis',
        'Export capabilities'
      ]
    },
    'book-appointment': {
      title: 'Book Appointment',
      description: 'Schedule appointments with AI assistance',
      icon: Calendar,
      content: 'Book appointments with healthcare providers using our intelligent scheduling system. Get recommendations for the best specialists based on your health needs.',
      features: [
        'Smart provider matching',
        'Automated scheduling',
        'Reminder notifications',
        'Virtual consultation options',
        'Calendar integration'
      ]
    },
    'disease-detection': {
      title: 'Disease Detection',
      description: 'AI-powered image analysis for early detection',
      icon: Camera,
      content: 'Upload medical images for AI-assisted analysis. Our advanced algorithms can help identify potential health concerns for early intervention.',
      features: [
        'Image upload and analysis',
        'AI diagnostic assistance',
        'Real-time results',
        'Professional review options',
        'Treatment recommendations'
      ]
    },
    'medical-query': {
      title: 'Medical Query',
      description: 'Get answers to your health questions',
      icon: HelpCircle,
      content: 'Ask medical questions and get evidence-based answers from our AI health assistant. Perfect for understanding symptoms and treatment options.',
      features: [
        'Natural language queries',
        'Evidence-based responses',
        'Symptom checker',
        'Treatment information',
        'Risk assessments'
      ]
    },
    'emergency-navigation': {
      title: 'Emergency Navigation',
      description: 'Quick access to emergency medical help',
      icon: Navigation,
      content: 'Find the nearest emergency facilities and get guided assistance during medical emergencies. Fast, reliable, and potentially life-saving.',
      features: [
        'Nearest hospital finder',
        'Emergency contact system',
        'GPS navigation',
        'Severity assessment',
        'Real-time availability'
      ]
    },
    'general-query': {
      title: 'General Query',
      description: 'Ask any health-related questions',
      icon: MessageCircle,
      content: 'General health information and lifestyle advice. Get personalized recommendations for wellness, nutrition, and preventive care.',
      features: [
        'Lifestyle recommendations',
        'Nutrition advice',
        'Exercise suggestions',
        'Wellness tracking',
        'Preventive care tips'
      ]
    },
    'profile': {
      title: 'Profile Management',
      description: 'Manage your account and preferences',
      icon: User,
      content: 'Update your personal information, manage privacy settings, and customize your MediConnect AI experience.',
      features: [
        'Personal information',
        'Privacy settings',
        'Notification preferences',
        'Data export options',
        'Account security'
      ]
    }
  };

  const currentFeature = feature ? featureData[feature as keyof typeof featureData] : null;

  if (!currentFeature) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <Card className="max-w-md bg-gradient-card border-medical-border shadow-card-medical">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Feature Not Found</h2>
              <p className="text-muted-foreground mb-6">The requested feature could not be found.</p>
              <Button variant="medical" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const Icon = currentFeature.icon;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="bg-gradient-card border-medical-border shadow-card-medical">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-medical rounded-2xl shadow-medical">
                <Icon className="h-12 w-12 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">
              {currentFeature.title}
            </CardTitle>
            <CardDescription className="text-lg">
              {currentFeature.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">About This Feature</h3>
              <p className="text-muted-foreground leading-relaxed">
                {currentFeature.content}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFeature.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-4 bg-accent/30 rounded-lg border border-medical-border"
                  >
                    <div className="w-2 h-2 bg-gradient-medical rounded-full mr-3"></div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                variant="medical" 
                size="lg"
                className="flex-1 shadow-medical hover:shadow-hover-medical"
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="flex-1 border-medical-border hover:bg-accent/50"
              >
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeaturePage;