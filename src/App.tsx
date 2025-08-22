import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { SiteProvider } from "@/contexts/SiteContext";
import { Suspense, lazy, useEffect } from "react";
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
const Forecast = lazy(() => import("./pages/Forecast"));

// Demo pages
const EnhancedStepperDemo = lazy(() => import("./pages/EnhancedStepperDemo"));

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
// Note: Integrations and Forecast are not currently integrated into main navigation

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      // Add better caching
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
      // Optimize mutation performance
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries();
        return { variables };
      },
    },
  },
});

function App() {
  // TEMPORARILY DISABLED: Performance service causing issues
  // useEffect(() => {
  //   performanceService.preloadCriticalResources();
  //   performanceService.optimizeBundleLoading();
    
  //   const interval = setInterval(() => {
  //     performanceService.optimizeMemory();
  //   }, 30000);
    
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SiteProvider>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Suspense fallback={<PageLoader />}>
                            <Dashboard />
                          </Suspense>
                        </Layout>
                      </AuthGuard>
                    }
                  />

                  {/* Sites - Main tab with nested routes */}
                  <Route
                    path="/sites"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Sites />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/sites/create"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteCreation />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/sites/:id"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Site />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/sites/:id/study"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteStudy />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />

                  {/* Approvals & Procurement - Main tab with nested routes */}
                  <Route
                    path="/approvals-procurement"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <ApprovalsProcurement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-approvals"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareApprovals />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-scoping"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareScoping />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/approvals-procurement/hardware-master"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareMaster />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />

                  {/* Deployment */}
                  <Route
                    path="/deployment"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Deployment />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />

                  {/* Forecast */}
                  <Route
                    path="/forecast"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Forecast />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />

                  {/* Assets - Main tab with nested routes */}
                  <Route
                    path="/assets"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Assets />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/assets/inventory"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Inventory />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/assets/license-management"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <LicenseManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />

                  {/* Platform Configuration - Main tab with nested routes */}
                  <Route
                    path="/platform-configuration"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <PlatformConfiguration />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/platform-configuration/admin"
                    element={
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Admin />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    }
                  />
                  {/* Note: Integrations and Forecast routes removed - not integrated into main navigation */}

                  {/* Demo routes */}
                  <Route
                    path="/demo/enhanced-stepper"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Suspense fallback={<PageLoader />}>
                            <EnhancedStepperDemo />
                          </Suspense>
                        </Layout>
                      </AuthGuard>
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
                  {/* Legacy redirects for unused routes removed */}

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
