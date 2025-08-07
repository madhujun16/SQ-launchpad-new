import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "@/components/AuthGuard";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { SiteProvider } from "@/contexts/SiteContext";
import { Suspense, lazy } from "react";
import { PageLoader } from "@/components/ui/loader";
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

// Sites-related pages
const SiteStudy = lazy(() => import("./pages/SiteStudy"));
const Site = lazy(() => import("./pages/Site"));
const SiteCreation = lazy(() => import("./pages/SiteCreation"));

// Approvals & Procurement related pages
const HardwareApprovals = lazy(() => import("./pages/HardwareApprovals"));
const HardwareScoping = lazy(() => import("./pages/HardwareScoping"));
const HardwareMaster = lazy(() => import("./pages/HardwareMaster"));

// Assets-related pages
const Inventory = lazy(() => import("./pages/Inventory"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));

// Platform Configuration related pages
const Integrations = lazy(() => import("./pages/Integrations"));
const Forecast = lazy(() => import("./pages/Forecast"));

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
                  
                  {/* Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Suspense fallback={<PageLoader />}>
                            <Dashboard />
                          </Suspense>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Sites - Main tab with nested routes */}
                  <Route
                    path="/sites"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Sites />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sites/create"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteCreation />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sites/:id"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Site />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sites/:id/study"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteStudy />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Approvals & Procurement - Main tab with nested routes */}
                  <Route
                    path="/approvals-procurement"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <ApprovalsProcurement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-approvals"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareApprovals />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-scoping"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareScoping />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-master"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareMaster />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Deployment */}
                  <Route
                    path="/deployment"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Deployment />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Assets - Main tab with nested routes */}
                  <Route
                    path="/assets"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Assets />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assets/inventory"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Inventory />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assets/license-management"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <LicenseManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Platform Configuration - Main tab with nested routes */}
                  <Route
                    path="/platform-configuration"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <PlatformConfiguration />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/platform-configuration/admin"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Admin />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/platform-configuration/integrations"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Integrations />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/platform-configuration/forecast"
                    element={
                      <ProtectedRoute>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Forecast />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </ProtectedRoute>
                    }
                  />

                  {/* Legacy route redirects */}
                  <Route path="/site-study" element={<Navigate to="/sites" replace />} />
                  <Route path="/site-creation" element={<Navigate to="/sites/create" replace />} />
                  <Route path="/hardware-approvals" element={<Navigate to="/approvals-procurement/hardware-approvals" replace />} />
                  <Route path="/hardware-scoping" element={<Navigate to="/approvals-procurement/hardware-scoping" replace />} />
                  <Route path="/hardware-master" element={<Navigate to="/approvals-procurement/hardware-master" replace />} />
                  <Route path="/inventory" element={<Navigate to="/assets/inventory" replace />} />
                  <Route path="/license-management" element={<Navigate to="/assets/license-management" replace />} />
                  <Route path="/admin" element={<Navigate to="/platform-configuration/admin" replace />} />
                  <Route path="/integrations" element={<Navigate to="/platform-configuration/integrations" replace />} />
                  <Route path="/forecast" element={<Navigate to="/platform-configuration/forecast" replace />} />

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
