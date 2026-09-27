import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="text-center p-8 rounded-2xl bg-gradient-card border border-medical-border shadow-card-medical backdrop-blur-md max-w-md w-full">
        <h1 className="mb-2 text-6xl font-extrabold bg-gradient-medical bg-clip-text text-transparent">
          404
        </h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <Button variant="medical" className="shadow-medical hover:shadow-hover-medical text-white font-medium" asChild>
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
