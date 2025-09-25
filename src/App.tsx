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

// Enhanced lazy loading with error handling and Chrome optimization
const createLazyComponent = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(() => {
    const startTime = performance.now();
    console.log(`🔄 Loading ${componentName}...`);
    
    return importFn()
      .then((module) => {
        const loadTime = performance.now() - startTime;
        console.log(`✅ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
        return module;
      })
      .catch((error) => {
        const loadTime = performance.now() - startTime;
        console.error(`❌ Failed to load ${componentName} after ${loadTime.toFixed(2)}ms:`, error);
        
        // Return a fallback component with Chrome-specific styling
        return {
          default: () => (
            <div className="flex items-center justify-center h-64 p-4">
              <div className="text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to Load {componentName}</h3>
                <p className="text-sm text-gray-600 mb-4">Please refresh the page or contact support if the issue persists.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )
        };
      });
  });
};

// Lazy load heavy components with better chunking and error handling
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Sites = createLazyComponent(() => import("./pages/Sites"), "Sites");
const ApprovalsProcurement = createLazyComponent(() => import("./pages/ApprovalsProcurement"), "ApprovalsProcurement");
const Deployment = createLazyComponent(() => import("./pages/Deployment"), "Deployment");
const Assets = createLazyComponent(() => import("./pages/Assets"), "Assets");

// Platform Configuration separate pages
const OrganizationsManagement = createLazyComponent(() => import("./pages/OrganizationsManagement"), "OrganizationsManagement");
const UserManagement = createLazyComponent(() => import("./pages/UserManagement"), "UserManagement");
const SoftwareHardwareManagement = createLazyComponent(() => import("./pages/SoftwareHardwareManagement"), "SoftwareHardwareManagement");
const GeneralSettings = createLazyComponent(() => import("./pages/GeneralSettings"), "GeneralSettings");
const AuditLogs = createLazyComponent(() => import("./pages/AuditLogs"), "AuditLogs");

const Forecast = createLazyComponent(() => import("./pages/Forecast"), "Forecast");

// Sites-related pages
const Site = createLazyComponent(() => import("./pages/Site"), "Site");
const SiteCreation = createLazyComponent(() => import("./pages/SiteCreation"), "SiteCreation");
const SiteFlowHub = createLazyComponent(() => import("./pages/SiteFlowHub"), "SiteFlowHub");
const SiteStepEdit = createLazyComponent(() => import("./pages/SiteStepEdit"), "SiteStepEdit");

// Approvals & Procurement related pages
const HardwareApprovals = createLazyComponent(() => import("./pages/HardwareApprovals"), "HardwareApprovals");
const HardwareScoping = createLazyComponent(() => import("./pages/HardwareScoping"), "HardwareScoping");
const HardwareMaster = createLazyComponent(() => import("./pages/HardwareMaster"), "HardwareMaster");

// Assets-related pages
const Inventory = createLazyComponent(() => import("./pages/Inventory"), "Inventory");
const LicenseManagement = createLazyComponent(() => import("./pages/LicenseManagement"), "LicenseManagement");

// Create a client with optimized settings for Chrome and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes - reduced for better performance
      retry: (failureCount, error) => {
        // Chrome-specific retry logic
        if (error?.message?.includes('Chrome') || error?.message?.includes('extension')) {
          console.warn('⚠️ Chrome-related error, reducing retries');
          return failureCount < 1;
        }
        return failureCount < 2;
      },
      gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      refetchInterval: false,
      // Chrome-specific optimizations
      networkMode: 'online',
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
  // Chrome-specific query client configuration
  logger: {
    log: console.log,
    warn: console.warn,
    error: (error) => {
      // Enhanced error logging for Chrome
      if (error?.message?.includes('Chrome') || error?.message?.includes('extension')) {
        console.warn('⚠️ Chrome-related query error:', error);
      } else {
        console.error('❌ Query error:', error);
      }
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
