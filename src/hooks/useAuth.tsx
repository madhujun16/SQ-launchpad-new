/**
 * Backend API Authentication Hook
 * Replaces Supabase authentication with backend API
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';
import type { UserRole } from '@/lib/roles';

// User types based on backend API
export interface BackendUser {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role?: string;
  roles?: string[];
  created_at?: string;
  updated_at?: string;
}

export type { UserRole };

interface AuthContextType {
  user: BackendUser | null;
  currentRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshing: boolean;
  forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        // Check if user is authenticated
        const isAuth = AuthService.isAuthenticated();
        
        if (isAuth) {
          const currentUser = AuthService.getCurrentUser();
          
          if (currentUser) {
            console.log('👤 User authenticated:', currentUser.email);
            setUser(currentUser);
            
            // Set roles
            const roles = currentUser.roles || [currentUser.role || 'admin'];
            setAvailableRoles(roles as UserRole[]);
            
            // Restore saved role or use first available
            const savedRole = localStorage.getItem('currentRole') as UserRole;
            if (savedRole && roles.includes(savedRole)) {
              setCurrentRole(savedRole);
            } else {
              setCurrentRole(roles[0] as UserRole);
            }
            
            // Validate token with backend
            try {
              const validation = await AuthService.validateToken();
              if (!validation.success || !validation.data?.valid) {
                console.warn('Token validation failed, clearing auth');
                await signOut();
              }
            } catch (error) {
              console.error('Token validation error:', error);
              // Don't force logout on validation error, token might still be valid
            }
          } else {
            console.log('ℹ️ No user data found');
          }
        } else {
          console.log('ℹ️ User not authenticated');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'backend_auth_token') {
        if (!e.newValue) {
          // Token removed, user logged out
          setUser(null);
          setCurrentRole(null);
          setAvailableRoles([]);
        } else {
          // Token added/changed, reload user
          const currentUser = AuthService.getCurrentUser();
          setUser(currentUser);
          
          if (currentUser) {
            const roles = currentUser.roles || [currentUser.role || 'admin'];
            setAvailableRoles(roles as UserRole[]);
            
            const savedRole = localStorage.getItem('currentRole') as UserRole;
            if (savedRole && roles.includes(savedRole)) {
              setCurrentRole(savedRole);
            } else {
              setCurrentRole(roles[0] as UserRole);
            }
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
      console.log('🔄 Switched role to:', role);
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      await AuthService.logout();
      setUser(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      localStorage.removeItem('currentRole');
      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const forceRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing user data...');
      
      // Validate current token
      const validation = await AuthService.validateToken();
      
      if (validation.success && validation.data?.valid) {
        // Update user data if provided
        if (validation.data.user) {
          setUser(validation.data.user);
          
          const roles = validation.data.user.roles || [validation.data.user.role || 'admin'];
          setAvailableRoles(roles as UserRole[]);
          
          // Update stored user
          localStorage.setItem('backend_user', JSON.stringify(validation.data.user));
        }
        console.log('✅ User data refreshed');
      } else {
        console.warn('⚠️ Token validation failed during refresh');
        await signOut();
      }
    } catch (error) {
      console.error('❌ Force refresh error:', error);
      // Try to refresh token
      try {
        const refreshResult = await AuthService.refreshToken();
        if (refreshResult.success && refreshResult.data) {
          setUser(refreshResult.data.user);
          console.log('✅ Token refreshed successfully');
        } else {
          console.warn('⚠️ Token refresh failed, signing out');
          await signOut();
        }
      } catch (refreshError) {
        console.error('❌ Token refresh error:', refreshError);
        await signOut();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    currentRole,
    availableRoles,
    switchRole,
    signOut,
    loading,
    refreshing,
    forceRefresh
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    console.error('useAuth: Context is null - AuthProvider may not be wrapping this component');
    // Return a minimal fallback to prevent crashes
    return {
      user: null,
      currentRole: null,
      availableRoles: [],
      switchRole: () => {},
      signOut: async () => {},
      loading: true,
      refreshing: false,
      forceRefresh: async () => {}
    };
  }
  
  return context;
};
