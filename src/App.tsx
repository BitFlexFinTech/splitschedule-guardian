import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Expenses from "./pages/Expenses";
import Messages from "./pages/Messages";
import IncidentLog from "./pages/IncidentLog";
import FileVault from "./pages/FileVault";
import Payments from "./pages/Payments";
import Calls from "./pages/Calls";
import Settings from "./pages/Settings";
import Invite from "./pages/Invite";
import Support from "./pages/Support";
import Reports from "./pages/Reports";
import Subscriptions from "./pages/Subscriptions";
import Integrations from "./pages/Integrations";
import Legal from "./pages/Legal";
import Admin from "./pages/Admin";
import LawyerDashboard from "./pages/LawyerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/incident-log" element={<IncidentLog />} />
              <Route path="/file-vault" element={<FileVault />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invite" element={<Invite />} />
              <Route path="/support" element={<Support />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard-lawyer" element={<LawyerDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
