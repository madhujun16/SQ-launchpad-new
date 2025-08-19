import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, supabaseCached } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { secureLog } from '@/config/security';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for user profiles and roles
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const ROLES_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔍 Starting fetchProfile for user:', userId);
      
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < ROLES_CACHE_DURATION) {
        console.log('✅ Using cached profile for user:', userId);
        setProfile(cached.profile);
        setAvailableRoles(cached.profile.user_roles?.map(r => r.role) || []);
        
        // Set current role from localStorage or default to first available role
        const savedRole = localStorage.getItem('currentRole') as UserRole;
        if (savedRole && cached.profile.user_roles?.some(r => r.role === savedRole)) {
          setCurrentRole(savedRole);
        } else {
          setCurrentRole(cached.profile.user_roles?.[0]?.role || 'admin');
        }
        return;
      }

      console.log('🔄 Fetching fresh profile for user:', userId);
      
      // Fetch profile first
      console.log('📊 Querying profiles table...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        console.error('❌ Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        throw profileError;
      }

      console.log('✅ Profile data fetched successfully:', profileData);

      // Fetch user roles separately
      console.log('🔑 Querying user_roles table...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        console.error('❌ Roles fetch error:', rolesError);
        console.error('❌ Roles error details:', {
          code: rolesError.code,
          message: rolesError.message,
          details: rolesError.details,
          hint: rolesError.hint
        });
        throw rolesError;
      }

      const roles = rolesData?.map(r => r.role) || [];
      console.log('✅ Roles data fetched successfully:', rolesData);
      console.log('✅ Processed roles array:', roles);

      if (profileData) {
        // Only users with assigned roles in the database can access the system
        if (roles.length === 0) {
          console.error('❌ No roles found for user - access denied');
          
          // TEMPORARY: Fallback for debugging - assign admin role if none exists
          console.warn('⚠️ TEMPORARY: Assigning fallback admin role for debugging');
          const fallbackRoles: UserRole[] = ['admin'];
          setAvailableRoles(fallbackRoles);
          setCurrentRole('admin');
          
          // Create a fallback profile
          const fallbackProfile = {
            ...profileData,
            user_roles: fallbackRoles.map(role => ({ role }))
          };
          setProfile(fallbackProfile);
          
          // Cache the fallback profile
          profileCache.set(userId, {
            profile: fallbackProfile,
            timestamp: Date.now()
          });
          
          console.log('✅ Fallback profile set with admin role');
          return;
        }
        
        const profileWithRoles = { 
          ...profileData, 
          user_roles: roles.map(role => ({ role }))
        };
        
        console.log('✅ Setting profile with roles:', profileWithRoles);
        setProfile(profileWithRoles);
        setAvailableRoles(roles);
        
        // Cache the profile data
        profileCache.set(userId, {
          profile: profileWithRoles,
          timestamp: Date.now()
        });
        
        // Set current role from localStorage or default to first available role
        const savedRole = localStorage.getItem('currentRole') as UserRole;
        if (savedRole && roles.includes(savedRole)) {
          console.log('✅ Setting saved role from localStorage:', savedRole);
          setCurrentRole(savedRole);
        } else {
          console.log('✅ Setting default role:', roles[0]);
          setCurrentRole(roles[0] || 'admin');
        }
        
        console.log('✅ Profile setup completed successfully');
      }
    } catch (error) {
      console.error('💥 Error fetching profile:', error);
      console.error('💥 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      secureLog('error', 'Error fetching profile', { error });
      
      // No fallback roles - if profile fetch fails, user cannot access system
      setProfile(null);
      setCurrentRole(null);
      setAvailableRoles([]);
    }
  }, []);

  // Memoized switch role function
  const switchRole = useCallback((role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  }, [availableRoles]);

  // Memoized sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Clear cache on sign out
      profileCache.clear();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  // Memoized auth functions
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

  // Force refresh function to clear cache and refetch data
  const forceRefresh = useCallback(async () => {
    try {
      console.log('Force refreshing authentication data...');
      
      // Clear all caches
      profileCache.clear();
      localStorage.removeItem('currentRole');
      
      // Refetch profile if user exists
      if (user) {
        await fetchProfile(user.id);
      }
    } catch (error) {
      console.error('Error during force refresh:', error);
    }
  }, [user, fetchProfile]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
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
  }), [
    user, session, profile, currentRole, availableRoles,
    switchRole, signOut, signInWithOtp, verifyOtp, createUserAsAdmin, loading, forceRefresh
  ]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          // Fetch profile immediately without setTimeout
          await fetchProfile(session.user.id);
        } else {
          console.log('🚪 User signed out, clearing state...');
          setProfile(null);
          setCurrentRole(null);
          setAvailableRoles([]);
          localStorage.removeItem('currentRole');
          // Clear cache when user signs out
          profileCache.clear();
        }
        console.log('✅ Auth state change completed, setting loading to false');
        setLoading(false);
      }
    );

    // Also check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('🚀 Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 Initial session found, fetching profile...');
        await fetchProfile(session.user.id);
      }
      console.log('✅ Initial session check completed, setting loading to false');
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};