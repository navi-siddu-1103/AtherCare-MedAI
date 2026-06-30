import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Check demo credentials first
      if (email === 'demo@mediconnect.ai' && password === 'demo123') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'Demo User');
        toast({
          title: "Login successful!",
          description: "Welcome to MediConnect AI Dashboard",
        });
        navigate('/dashboard');
        setIsLoading(false);
        return;
      }

      // Check registered users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (user) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', user.name);
        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        });
        navigate('/dashboard');
        setIsLoading(false);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Try demo@mediconnect.ai / demo123 for demo access",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-medical rounded-full shadow-medical">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your MediConnect AI account
            </p>
          </div>

          <Card className="shadow-card-medical border-medical-border bg-gradient-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-foreground">Sign in</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="demo@mediconnect.ai"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-medical-border focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="demo123"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-medical-border focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-medical hover:bg-primary-glow/90 shadow-medical hover:shadow-hover-medical"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    className="font-medium text-primary hover:text-primary-glow transition-colors"
                  >
                    Create Account
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  Demo credentials: demo@mediconnect.ai / demo123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;