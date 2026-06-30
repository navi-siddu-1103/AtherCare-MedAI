import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

const Navbar = ({ isLoggedIn = false, onLogout }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-medical-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-medical rounded-lg group-hover:shadow-medical transition-all duration-300">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediConnect AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoggedIn && (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-foreground hover:text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/" 
                  className="text-foreground hover:text-primary transition-colors duration-200"
                >
                  Home
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <Button 
                variant="medical" 
                onClick={handleLogout}
                className="shadow-medical hover:shadow-hover-medical"
              >
                Logout
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/signup')}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Create Account
                </Button>
                <Button 
                  variant="medical" 
                  onClick={() => navigate('/login')}
                  className="shadow-medical hover:shadow-hover-medical"
                >
                  Login
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-medical-border">
            <div className="flex flex-col space-y-3">
              {isLoggedIn && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-foreground hover:text-primary transition-colors duration-200 px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/" 
                    className="text-foreground hover:text-primary transition-colors duration-200 px-4 py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                </>
              )}
              
              {isLoggedIn ? (
                <Button 
                  variant="medical" 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mx-4 shadow-medical hover:shadow-hover-medical"
                >
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 mx-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      navigate('/signup');
                      setIsMenuOpen(false);
                    }}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Create Account
                  </Button>
                  <Button 
                    variant="medical" 
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                    className="shadow-medical hover:shadow-hover-medical"
                  >
                    Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;