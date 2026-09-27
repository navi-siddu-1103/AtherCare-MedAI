import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/login"); // Redirect if not logged in
      return;
    }

    setUserName(localStorage.getItem("userName"));
    setUserEmail(localStorage.getItem("userEmail"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-card-medical border-medical-border bg-gradient-card backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-medical bg-clip-text text-transparent">
              My Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-medical-border">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{userName || "User"}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/40 border border-medical-border">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">{userEmail || "user@example.com"}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full mt-6 bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium py-2.5 px-4 rounded-lg hover:from-rose-600 hover:to-red-700 transition-all shadow-md"
            >
              Sign Out
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
