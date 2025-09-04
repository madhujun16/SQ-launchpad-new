import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleBasedRoute } from "@/components/RoleBasedRoute";
import { SiteProvider } from "@/contexts/SiteContext";
import { Suspense, lazy } from "react";
import { PageLoader } from "@/components/ui/loader";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";

// Lazy load heavy components with better chunking
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sites = lazy(() => import("./pages/Sites"));
const ApprovalsProcurement = lazy(() => import("./pages/ApprovalsProcurement"));
const Deployment = lazy(() => import("./pages/Deployment"));
const Assets = lazy(() => import("./pages/Assets"));

// Platform Configuration separate pages
const OrganizationsManagement = lazy(() => import("./pages/OrganizationsManagement"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const SoftwareHardwareManagement = lazy(() => import("./pages/SoftwareHardwareManagement"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

const Forecast = lazy(() => import("./pages/Forecast"));

// Sites-related pages
const Site = lazy(() => import("./pages/Site"));
const SiteCreation = lazy(() => import("./pages/SiteCreation"));

// Approvals & Procurement related pages
const HardwareApprovals = lazy(() => import("./pages/HardwareApprovals"));
const HardwareScoping = lazy(() => import("./pages/HardwareScoping"));
const HardwareMaster = lazy(() => import("./pages/HardwareMaster"));

// Assets-related pages
const Inventory = lazy(() => import("./pages/Inventory"));
const LicenseManagement = lazy(() => import("./pages/LicenseManagement"));

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - reduced for better performance
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              {/* Public routes - no providers needed */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={
                <AuthProvider>
                  <Auth />
                </AuthProvider>
              } />
              
              {/* Protected routes - wrapped with providers */}
              <Route
                path="/dashboard"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoader />}>
                                <Dashboard />
                              </Suspense>
                            </ErrorBoundary>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Protected routes with auth */}
              <Route
                path="/sites"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Sites />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/sites/create"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteCreation />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/sites/:id"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Site />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Approvals & Procurement */}
              <Route
                path="/approvals-procurement"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <ApprovalsProcurement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/approvals-procurement/hardware-approvals"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareApprovals />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/approvals-procurement/hardware-scoping"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareScoping />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/approvals-procurement/hardware-master"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <HardwareMaster />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Deployment */}
              <Route
                path="/deployment"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Deployment />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Assets */}
              <Route
                path="/assets"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Assets />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/assets/inventory"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Inventory />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/assets/license-management"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <LicenseManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Platform Configuration separate pages */}
              <Route
                path="/platform-configuration/organizations"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <OrganizationsManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/platform-configuration/users"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <UserManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/platform-configuration/software-hardware"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SoftwareHardwareManagement />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/platform-configuration/audit-logs"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <AuditLogs />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              {/* Forecast */}
              <Route
                path="/forecast"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <Forecast />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
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

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
