// Authentication Hook - OTP based authentication with sqlaunchpad.com API

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import type { Database } from '@/types/database';

// Types
type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: Array<{
    role: Database['public']['Enums']['app_role'];
  }>;
};

type UserRole = Database['public']['Enums']['app_role'];

// User type from auth API
interface User {
  id: string;
  email?: string;
  full_name?: string;
}

// Session type
interface Session {
  access_token: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  currentRole: UserRole | null;
  availableRoles: UserRole[];
  switchRole: (role: UserRole) => void;
  signOut: () => Promise<void>;
  signInWithOtp: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  createUserAsAdmin: (email: string, password: string | undefined, role: UserRole, fullName: string, roles: Array<{ role: UserRole }>) => Promise<{ data?: { user: User } | null; error: string | null }>;
  loading: boolean;
  refreshing: boolean;
  forceRefresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Bypass auth if enabled via environment variable
const BYPASS_AUTH = import.meta.env.VITE_BYPASS_AUTH === 'true';

// Mock user for bypass mode
const MOCK_USER: User = {
  id: 'bypass-user',
  email: 'dev@sqlaunchpad.com',
  full_name: 'Development User',
};

const MOCK_PROFILE: Profile = {
  id: 'bypass-user',
  email: 'dev@sqlaunchpad.com',
  full_name: 'Development User',
  user_roles: [{ role: 'admin' }],
} as Profile;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(BYPASS_AUTH ? MOCK_USER : null);
  const [session, setSession] = useState<Session | null>(BYPASS_AUTH ? { access_token: 'bypass', user: MOCK_USER } : null);
  const [profile, setProfile] = useState<Profile | null>(BYPASS_AUTH ? MOCK_PROFILE : null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(BYPASS_AUTH ? 'admin' : null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(BYPASS_AUTH ? ['admin'] : []);
  const [loading, setLoading] = useState(!BYPASS_AUTH);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize auth state from backend on mount
  useEffect(() => {
    // Skip auth initialization if bypass is enabled
    if (BYPASS_AUTH) {
      setLoading(false);
      return;
    }

    const initializeAuth = async () => {
      // Try to get current user from backend (uses session cookie)
      const currentUser = await AuthService.getCurrentUser();
      
      if (currentUser) {
        // User is authenticated, set up state
        const authUser: User = {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.full_name,
        };

        setUser(authUser);
        setSession({
          access_token: 'cookie-based',
          user: authUser,
        });

        // Set up roles from user data
        const roles = currentUser.roles?.map(r => r.role as UserRole) || [];
        if (roles.length === 0 && currentUser.role) {
          roles.push(currentUser.role as UserRole);
        }
        // Default to admin if no roles specified
        if (roles.length === 0) {
          roles.push('admin');
        }
        setAvailableRoles(roles);

        // Restore current role from localStorage or use first available
        const savedRole = localStorage.getItem('currentRole') as UserRole | null;
        if (savedRole && roles.includes(savedRole)) {
          setCurrentRole(savedRole);
        } else {
          setCurrentRole(roles[0]);
        }

        // Create profile from user data
        setProfile({
          id: currentUser.id,
          email: currentUser.email || '',
          full_name: currentUser.full_name || '',
          user_roles: roles.map(role => ({ role })),
        } as Profile);

        // Store user data locally
        AuthService.setStoredUser(currentUser);
        AuthService.setToken('cookie-based');
      } else {
        // No valid session, clear any stale data
        AuthService.clearAuth();
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  const signOut = async () => {
    // Call backend logout endpoint to clear session cookie
    await AuthService.logout();
    
    // Clear local state
    AuthService.clearAuth();
    setUser(null);
    setSession(null);
    setProfile(null);
    setCurrentRole(null);
    setAvailableRoles([]);
  };

  const signInWithOtp = async (email: string): Promise<{ error: string | null }> => {
    try {
      const result = await AuthService.sendOtp(email);
      
      if (!result.success) {
        return { error: result.error || 'Failed to send OTP' };
      }

      return { error: null };
    } catch (error) {
      console.error('signInWithOtp error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<{ error: string | null }> => {
    try {
      const result = await AuthService.verifyOtp(email, otp);

      if (!result.success) {
        return { error: result.error || 'Invalid OTP' };
      }

      // Store auth data
      if (result.token) {
        AuthService.setToken(result.token);
      }

      // After OTP verification, the backend sets a session cookie
      // Wait a moment for the cookie to be set, then verify the session
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify the session by calling /user/me to ensure the cookie is working
      const currentUser = await AuthService.getCurrentUser();
      
      if (!currentUser) {
        console.warn('Session cookie not set properly, but OTP was verified. Using response data.');
        // Use the user data from OTP response as fallback
      }

      // Use the verified user data from /user/me, or fallback to OTP response
      const userData = currentUser || result.user || {
        id: crypto.randomUUID(),
        email: email,
        full_name: email.split('@')[0],
      };

      // Ensure we have an ID
      if (!userData.id && result.user?.id) {
        userData.id = result.user.id;
      }

      AuthService.setStoredUser(userData);

      // Update state
      const authUser: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      };

      setUser(authUser);
      setSession({
        access_token: 'cookie-based', // Session is in cookie, not localStorage
        user: authUser,
      });

      // Set up roles
      const roles = userData.roles?.map(r => r.role as UserRole) || [];
      if (roles.length === 0 && userData.role) {
        roles.push(userData.role as UserRole);
      }
      // Default to admin if no roles specified
      if (roles.length === 0) {
        roles.push('admin');
      }
      setAvailableRoles(roles);
      setCurrentRole(roles[0]);
      localStorage.setItem('currentRole', roles[0]);

      // Create profile
      setProfile({
        id: userData.id,
        email: userData.email || email,
        full_name: userData.full_name || '',
        user_roles: roles.map(role => ({ role })),
      } as Profile);

      console.log('✅ Authentication successful, session cookie should be set');
      return { error: null };
    } catch (error) {
      console.error('verifyOtp error:', error);
      return { error: error instanceof Error ? error.message : 'Failed to verify OTP' };
    }
  };

  const createUserAsAdmin = async (
    email: string, 
    password: string | undefined, 
    role: UserRole, 
    fullName: string, 
    roles: Array<{ role: UserRole }>
  ): Promise<{ data?: { user: User } | null; error: string | null }> => {
    // TODO: Implement admin user creation API
    console.warn('createUserAsAdmin not implemented - need backend API');
    return { error: 'User creation API not implemented', data: null };
  };

  const forceRefresh = async () => {
    setRefreshing(true);
    
    // Fetch current user from backend
    const currentUser = await AuthService.getCurrentUser();
    
    if (currentUser) {
      const authUser: User = {
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.full_name,
      };
      
      setUser(authUser);
      setSession({
        access_token: 'cookie-based',
        user: authUser,
      });

      // Update roles
      const roles = currentUser.roles?.map(r => r.role as UserRole) || [];
      if (roles.length === 0 && currentUser.role) {
        roles.push(currentUser.role as UserRole);
      }
      if (roles.length === 0) {
        roles.push('admin');
      }
      setAvailableRoles(roles);
      
      // Update profile
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.full_name || '',
        user_roles: roles.map(role => ({ role })),
      } as Profile);
    } else {
      // Session expired or invalid
      AuthService.clearAuth();
      setUser(null);
      setSession(null);
      setProfile(null);
      setCurrentRole(null);
      setAvailableRoles([]);
    }
    
    setRefreshing(false);
  };

  const contextValue: AuthContextType = {
    user,
    session,
    profile,
    currentRole,
    availableRoles,
    switchRole,
    signOut,
    signInWithOtp,
    verifyOtp,
    createUserAsAdmin,
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
    return {
      user: null,
      session: null,
      profile: null,
      currentRole: null,
      availableRoles: [],
      switchRole: () => {},
      signOut: async () => {},
      signInWithOtp: async () => ({ error: 'Context not ready' }),
      verifyOtp: async () => ({ error: 'Context not ready' }),
      createUserAsAdmin: async () => ({ error: 'Context not ready', data: null }) as any,
      loading: false,
      refreshing: false,
      forceRefresh: async () => {}
    };
  }
  
  return context;
};
