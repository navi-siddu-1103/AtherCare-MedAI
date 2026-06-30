import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const UserStats = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);

    const loggedEmail = localStorage.getItem("userEmail");
    setCurrentUser(loggedEmail);
  }, []);

  const deleteMyAccount = () => {
    if (!currentUser) return;

    // Remove user from list
    const updatedUsers = users.filter((u) => u.email !== currentUser);

    // Save updated list
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Clear login session
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");

    toast({
      title: "Account deleted successfully",
      description: "Your account has been removed permanently.",
    });

    // Redirect to login
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-2xl shadow-card-medical border-medical-border bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-foreground">
              🔐 User Account Overview
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* Total Accounts */}
            <div className="bg-white/10 p-4 rounded-xl shadow-medical">
              <h3 className="text-lg font-semibold text-foreground">
                Total Registered Accounts:
              </h3>
              <p className="text-3xl font-bold text-primary mt-1">
                {users.length}
              </p>
            </div>

            {/* Current User */}
            <div className="bg-white/10 p-4 rounded-xl shadow-medical space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Currently Logged-In User:
              </h3>
              <p className="text-primary mt-1 text-xl">
                {currentUser ? currentUser : "No user is logged in"}
              </p>

              {/* Delete Account Button – only visible to logged-in user */}
              {currentUser && (
                <Button
                  onClick={deleteMyAccount}
                  className="bg-red-600 hover:bg-red-700 text-white mt-3"
                >
                  Delete My Account
                </Button>
              )}
            </div>

            {/* Registered Users */}
            <div className="bg-white/10 p-4 rounded-xl shadow-medical">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Registered Users List:
              </h3>

              {users.length === 0 ? (
                <p className="text-muted-foreground">No users registered yet.</p>
              ) : (
                <ul className="space-y-3">
                  {users.map((u, index) => (
                    <li
                      key={index}
                      className="p-3 bg-white/5 rounded-lg border border-medical-border"
                    >
                      <p className="text-foreground font-medium">{u.name}</p>
                      <p className="text-muted-foreground text-sm">{u.email}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserStats;
