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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = AuthService.getStoredUser();
      const token = AuthService.getToken();

      if (storedUser && token) {
        const authUser: User = {
          id: storedUser.id,
          email: storedUser.email,
          full_name: storedUser.full_name,
        };

        setUser(authUser);
        setSession({
          access_token: token,
          user: authUser,
        });

        // Set up roles from stored user
        const roles = storedUser.roles?.map(r => r.role as UserRole) || [];
        if (roles.length === 0 && storedUser.role) {
          roles.push(storedUser.role as UserRole);
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
          id: storedUser.id,
          email: storedUser.email || '',
          full_name: storedUser.full_name || '',
          user_roles: roles.map(role => ({ role })),
        } as Profile);
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

      // If no user data returned, create a minimal user object
      const userData = result.user || {
        id: crypto.randomUUID(),
        email: email,
        full_name: email.split('@')[0],
      };

      AuthService.setStoredUser(userData);

      // Update state
      const authUser: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
      };

      setUser(authUser);
      setSession({
        access_token: result.token || 'authenticated',
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
    // Re-initialize from localStorage
    const storedUser = AuthService.getStoredUser();
    const token = AuthService.getToken();

    if (storedUser && token) {
      const authUser: User = {
        id: storedUser.id,
        email: storedUser.email,
        full_name: storedUser.full_name,
      };
      setUser(authUser);
      setSession({
        access_token: token,
        user: authUser,
      });
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
