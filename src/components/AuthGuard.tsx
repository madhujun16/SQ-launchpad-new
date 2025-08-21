import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, currentRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Function to get the appropriate dashboard route based on role
  const getDashboardRoute = (role: string | null) => {
    switch (role) {
      case 'admin':
        return '/dashboard'; // Admin dashboard
      case 'ops_manager':
        return '/dashboard'; // Ops Manager dashboard
      case 'deployment_engineer':
        return '/dashboard'; // Deployment Engineer dashboard
      default:
        return '/dashboard'; // Default dashboard
    }
  };

  // Function to check if current path is a dashboard route
  const isDashboardRoute = (path: string) => {
    return path === '/dashboard' || path === '/';
  };

  // Handle authentication and initial login redirection
  useEffect(() => {
    if (!loading && !user && location.pathname !== '/auth') {
      // Redirect to auth if not logged in
      navigate('/auth');
    } else if (!loading && user && currentRole) {
      // User is logged in and has a role
      const dashboardRoute = getDashboardRoute(currentRole);
      
      // If user is on the landing page or auth page, redirect to their dashboard
      if (location.pathname === '/' || location.pathname === '/auth') {
        navigate(dashboardRoute);
      }
    }
  }, [user, loading, navigate, location.pathname]);

  // Handle role switching - redirect to appropriate dashboard when role changes
  useEffect(() => {
    if (!loading && user && currentRole) {
      const dashboardRoute = getDashboardRoute(currentRole);
      
      // If user is on a dashboard route, ensure they're on the correct dashboard
      if (isDashboardRoute(location.pathname)) {
        if (location.pathname !== dashboardRoute) {
          navigate(dashboardRoute);
        }
      }
    }
  }, [currentRole, loading, user, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && location.pathname !== '/auth') {
    return null;
  }

  return <>{children}</>;
};