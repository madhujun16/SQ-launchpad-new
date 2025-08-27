
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  user_roles?: Array<{
    role: Database['public']['Enums']['app_role'];
  }>;
};

type UserRole = Database['public']['Enums']['app_role'];

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
  createUserAsAdmin: (email: string, password: string, role: UserRole) => Promise<{ error: string | null }>;
  loading: boolean;
  forceRefresh: () => Promise<void>;
}

// Create context with a proper default value instead of undefined
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  currentRole: null,
  availableRoles: [],
  switchRole: () => {},
  signOut: async () => {},
  signInWithOtp: async () => ({ error: 'Context not ready' }),
  verifyOtp: async () => ({ error: 'Context not ready' }),
  createUserAsAdmin: async () => ({ error: 'Context not ready' }),
  loading: true,
  forceRefresh: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = React.useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = React.useState<UserRole[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Simple profile fetch function
  const fetchProfile = React.useCallback(async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch error:', profileError.message);
        return;
      }

      if (!profileData) {
        console.warn('No profile found for user');
        return;
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.warn('Roles fetch error:', rolesError.message);
        return;
      }

      const roles = rolesData?.map(r => r.role) || ['admin'];
      const profileWithRoles: Profile = { 
        ...profileData, 
        user_roles: roles.map(role => ({ role }))
      };
      
      setProfile(profileWithRoles);
      setAvailableRoles(roles);
      
      // Set current role from localStorage or default to first available role
      const savedRole = localStorage.getItem('currentRole') as UserRole;
      if (savedRole && roles.includes(savedRole)) {
        setCurrentRole(savedRole);
      } else {
        setCurrentRole(roles[0]);
      }
      
      console.log('✅ Profile setup completed successfully');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  // Simple switch role function
  const switchRole = useCallback((role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  }, [availableRoles]);

  // Simple sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentRole(null);
      setAvailableRoles([]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Simple auth functions
  const signInWithOtp = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  const createUserAsAdmin = useCallback(async (email: string, password: string, role: UserRole) => {
    try {
      const { error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role }
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }, []);

  // Simple force refresh function
  const forceRefresh = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = React.useMemo(() => {
    const value = {
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
      forceRefresh
    };
    console.log('🔧 AuthProvider: Context value updated:', value);
    return value;
  }, [
    user, session, profile, currentRole, availableRoles,
    switchRole, signOut, signInWithOtp, verifyOtp, createUserAsAdmin, loading, forceRefresh
  ]);

  React.useEffect(() => {
    console.log('🚀 AuthProvider: Starting initialization');
    
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('🚀 Initial session check:', initialSession?.user?.id);
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        
        // Always set loading to false
        setLoading(false);
        console.log('✅ AuthProvider: Initialization complete, loading set to false');

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              setProfile(null);
              setCurrentRole(null);
              setAvailableRoles([]);
              localStorage.removeItem('currentRole');
            }
            
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, [fetchProfile]);

  // Show loader only while actually loading
  if (loading) {
    console.log('🔧 AuthProvider: Still loading, showing loader');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white/90">
        <div className="text-center">
          <div className="text-gray-600">Initializing authentication...</div>
        </div>
      </div>
    );
  }

  console.log('🔧 AuthProvider: Ready, rendering children');
  console.log('🔧 AuthProvider: Final context value:', contextValue);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('🔧 useAuth: Hook called, AuthContext:', AuthContext);
  
  const context = React.useContext(AuthContext);
  
  // The context should always have a value now, but let's keep some logging for debugging
  console.log('🔧 useAuth: Context result:', context);
  
  if (!context) {
    console.error('🔧 useAuth: Context is null/undefined! This should not happen.');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
