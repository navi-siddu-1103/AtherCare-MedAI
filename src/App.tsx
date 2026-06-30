import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import FeaturePage from "./pages/FeaturePage";
import NotFound from "./pages/NotFound";
import ChatbotSection from "@/pages/ChatbotSection";
import BloodAnalyzer from "@/pages/bloodanalyzer";
import AISkinScanner from "@/pages/AISkinScanner";
import Profile from "@/pages/Profile";
import UserStats from "./pages/UserStats";
import EmergencyNavigation from "@/pages/EmergencyNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medical-history" element={<FeaturePage />} />
          <Route path="/chatbot" element={<ChatbotSection />} />
          <Route path="/book-appointment" element={<FeaturePage />} />
          <Route path="/userstats" element={<UserStats />} />

          <Route path="/medical-query" element={<FeaturePage />} />
           <Route path="/disease-detection" element={<AISkinScanner />} />
          <Route path="/blood-analyzer" element={<BloodAnalyzer />} />
          <Route path="/emergency-navigation" element={<EmergencyNavigation />} />
          <Route path="/general-query" element={<FeaturePage />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


/*
frontend -> api 
bacend 
-model.py
-api.py


*/