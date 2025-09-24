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

// Enhanced lazy loading with error handling
const createLazyComponent = (importFn: () => Promise<any>) => {
  return lazy(() => 
    importFn().catch((error) => {
      console.error('Failed to load component:', error);
      // Return a fallback component
      return {
        default: () => (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load Component</h3>
              <p className="text-sm text-gray-600">Please refresh the page or contact support if the issue persists.</p>
            </div>
          </div>
        )
      };
    })
  );
};

// Lazy load heavy components with better chunking and error handling
const Dashboard = createLazyComponent(() => import("./pages/Dashboard"));
const Sites = createLazyComponent(() => import("./pages/Sites"));
const ApprovalsProcurement = createLazyComponent(() => import("./pages/ApprovalsProcurement"));
const Deployment = createLazyComponent(() => import("./pages/Deployment"));
const Assets = createLazyComponent(() => import("./pages/Assets"));

// Platform Configuration separate pages
const OrganizationsManagement = createLazyComponent(() => import("./pages/OrganizationsManagement"));
const UserManagement = createLazyComponent(() => import("./pages/UserManagement"));
const SoftwareHardwareManagement = createLazyComponent(() => import("./pages/SoftwareHardwareManagement"));
const GeneralSettings = createLazyComponent(() => import("./pages/GeneralSettings"));
const AuditLogs = createLazyComponent(() => import("./pages/AuditLogs"));

const Forecast = createLazyComponent(() => import("./pages/Forecast"));

// Sites-related pages
const Site = createLazyComponent(() => import("./pages/Site"));
const SiteCreation = createLazyComponent(() => import("./pages/SiteCreation"));
const SiteFlowHub = createLazyComponent(() => import("./pages/SiteFlowHub"));
const SiteStepEdit = createLazyComponent(() => import("./pages/SiteStepEdit"));

// Approvals & Procurement related pages
const HardwareApprovals = createLazyComponent(() => import("./pages/HardwareApprovals"));
const HardwareScoping = createLazyComponent(() => import("./pages/HardwareScoping"));
const HardwareMaster = createLazyComponent(() => import("./pages/HardwareMaster"));

// Assets-related pages
const Inventory = createLazyComponent(() => import("./pages/Inventory"));
const LicenseManagement = createLazyComponent(() => import("./pages/LicenseManagement"));

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
                path="/sites/:id/flow"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteFlowHub />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

              <Route
                path="/sites/:id/flow/:stepKey"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <SiteStepEdit />
                            </Suspense>
                          </Layout>
                        </RoleBasedRoute>
                      </AuthGuard>
                    </SiteProvider>
                  </AuthProvider>
                }
              />

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
                path="/platform-configuration/general"
                element={
                  <AuthProvider>
                    <SiteProvider>
                      <AuthGuard>
                        <RoleBasedRoute>
                          <Layout>
                            <Suspense fallback={<PageLoader />}>
                              <GeneralSettings />
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
