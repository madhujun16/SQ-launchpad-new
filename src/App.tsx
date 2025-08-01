import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/AuthGuard";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import OpsManager from "./pages/OpsManager";
import Deployment from "./pages/Deployment";
import SiteStudy from "./pages/SiteStudy";
import Site from "./pages/Site";
import HardwareScoping from "./pages/HardwareScoping";
import Integrations from "./pages/Integrations";
import Forecast from "./pages/Forecast";
import Inventory from "./pages/Inventory";
import LicenseManagement from "./pages/LicenseManagement";
import NotFound from "./pages/NotFound";
import SiteCreationForm from "./components/SiteCreationForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Index />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Admin />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/ops-manager" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <OpsManager />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/deployment" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Deployment />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/site-study" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <SiteStudy />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/site" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Site />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/hardware-scoping" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <HardwareScoping />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/control-desk" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Integrations />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/forecast" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Forecast />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Inventory />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/license-management" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <LicenseManagement />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/site-creation" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <SiteCreationForm />
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
