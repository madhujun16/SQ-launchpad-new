import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/AuthGuard";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { SiteProvider } from "@/contexts/SiteContext";
import { Suspense, lazy } from "react";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Lazy load heavy components
const Index = lazy(() => import("./pages/Index"));
const Admin = lazy(() => import("./pages/Admin"));
const SiteStudy = lazy(() => import("./pages/SiteStudy"));
const Site = lazy(() => import("./pages/Site"));
const HardwareScoping = lazy(() => import("./pages/HardwareScoping"));
const HardwareApprovals = lazy(() => import("./pages/HardwareApprovals"));
const HardwareMaster = lazy(() => import("./pages/HardwareMaster"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Forecast = lazy(() => import("./pages/Forecast"));
const Inventory = lazy(() => import("./pages/Inventory"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));
const SiteCreation = lazy(() => import("./pages/SiteCreation"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SiteProvider>
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Index />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Admin />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            <Route path="/site-study" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SiteStudy />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/site" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Site />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/hardware-scoping" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <HardwareScoping />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/hardware-approvals" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <HardwareApprovals />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/hardware-master" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <HardwareMaster />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/control-desk" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Integrations />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/forecast" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Forecast />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Inventory />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/license-management" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <LicenseManagement />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />
            <Route path="/site-creation" element={
              <ProtectedRoute>
                <RoleBasedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <SiteCreation />
                  </Suspense>
                </RoleBasedRoute>
              </ProtectedRoute>
            } />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <PerformanceMonitor />
          </SiteProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
