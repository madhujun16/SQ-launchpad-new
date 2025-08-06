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
import Layout from "./components/Layout";

// Lazy load heavy components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sites = lazy(() => import("./pages/Sites"));
const ApprovalsProcurement = lazy(() => import("./pages/ApprovalsProcurement"));
const Deployment = lazy(() => import("./pages/Deployment"));
const Assets = lazy(() => import("./pages/Assets"));
const PlatformConfiguration = lazy(() => import("./pages/PlatformConfiguration"));
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
                        <Layout>
                          <Suspense fallback={<div>Loading...</div>}>
                            <Dashboard />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sites"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Sites />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approvals-procurement"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <ApprovalsProcurement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/deployment"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Deployment />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assets"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Assets />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/platform-configuration"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <PlatformConfiguration />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Admin />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site-study"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <SiteStudy />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site/:id"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Site />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-scoping"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <HardwareScoping />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-approvals"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <HardwareApprovals />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hardware-master"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <HardwareMaster />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/integrations"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Integrations />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/forecast"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Forecast />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <Inventory />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/license-management"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <LicenseManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/site-creation"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<div>Loading...</div>}>
                              <SiteCreation />
                            </Suspense>
                          </Layout>
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
