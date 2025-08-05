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
import { testDatabase } from "@/utils/test-db";

// Make test function available globally for debugging
(window as any).testDatabase = testDatabase;

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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SiteProvider>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<div>Loading...</div>}>
                          <Index />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Admin />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site-study"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <SiteStudy />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Site />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-scoping"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <HardwareScoping />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-approvals"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <HardwareApprovals />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-master"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <HardwareMaster />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/integrations"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Integrations />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forecast"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Forecast />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Inventory />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/license-management"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <LicenseManagement />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site-creation"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Suspense fallback={<div>Loading...</div>}>
                            <SiteCreation />
                          </Suspense>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <Toaster />
              <Sonner />
            </SiteProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
