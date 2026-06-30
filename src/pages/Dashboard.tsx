import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  Camera, 
  HelpCircle, 
  Navigation, 
  MessageCircle, 
  User 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const email = localStorage.getItem('userEmail');
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    if (email) {
      setUserEmail(email);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  };

  const features = [
    // {
    //   title: 'Medical History',
    //   description: 'View your health records',
    //   icon: Activity,
    //   path: '/medical-history'
    // },
    
    {
      title: 'Disease Detection',
      description: 'Analyze images',
      icon: Camera,
      path: '/disease-detection'
    },
    {
  title: 'Blood Analyzer',
  description: 'Upload and analyze reports',
  icon: Activity, // or another suitable icon
  path: '/blood-analyzer'
    },

    {
      title: 'Emergency Navigation',
      description: 'Find help fast',
      icon: Navigation,
      path: '/emergency-navigation'
    },
    {
  title: 'General Query',
  description: 'Ask anything',
  icon: MessageCircle,
  path: '/chatbot'
    },

    {
      title: 'Profile',
      description: 'Manage your account',
      icon: User,
      path: '/profile'
    },
    {
      title: 'User Stats',
      description: '',
      icon: Calendar,
      path: '/userstats'
    }
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const userName = userEmail.split('@')[0];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isLoggedIn={true} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, <span className="text-primary">{userName}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">
              This is your personalized dashboard. Use the cards below to explore MediConnect AI's features tailored to your health needs.
            </p>
          </div>
          <Button 
            variant="medical" 
            onClick={handleLogout}
            className="shadow-medical hover:shadow-hover-medical"
          >
            Logout
          </Button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onClick={() => handleFeatureClick(feature.path)}
              className="animate-in fade-in-50 duration-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;