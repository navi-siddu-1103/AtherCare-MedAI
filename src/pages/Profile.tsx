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
        <Card className="w-full max-w-md shadow-card-medical border-medical-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">My Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold">{userName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <span>{userEmail}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="w-full mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
