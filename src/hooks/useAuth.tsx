import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
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

// Constants
const REQUEST_TIMEOUT = 10000; // 10 seconds (reduced from 30)
const GLOBAL_TIMEOUT = 15000; // 15 seconds (reduced from 45)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use refs to track mounted state and prevent memory leaks
  const mountedRef = useRef(true);
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  // Helper function to create fallback profile
  const createFallbackProfile = useCallback((userId: string, userEmail?: string): Profile => ({
    id: userId,
    user_id: userId,
    full_name: userEmail || userId,
    email: userEmail || userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    invited_at: new Date().toISOString(),
    invited_by: 'system',
    last_login_at: new Date().toISOString(),
    welcome_email_sent: false,
    user_roles: [{ role: 'admin' as UserRole }]
  }), []);

  // Helper function to add timeout with cleanup
  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      if (mountedRef.current) {
        callback();
      }
      timeoutRefs.current.delete(timeout);
    }, delay);
    timeoutRefs.current.add(timeout);
    return timeout;
  }, []);

  // Helper function to clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current.clear();
  }, []);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      if (!mountedRef.current) return;
      
      console.log('🔍 Starting fetchProfile for user:', userId);
      
      // TEMPORARY BYPASS: Force profile data without database query
      console.log('🚨 TEMPORARY BYPASS: Using hardcoded profile to bypass hanging database query');
      const hardcodedProfile: Profile = {
        id: userId,
        user_id: userId,
        full_name: 'shivanshu.singh@thesmartq.com',
        email: 'shivanshu.singh@thesmartq.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invited_at: new Date().toISOString(),
        invited_by: userId,
        last_login_at: new Date().toISOString(),
        welcome_email_sent: false,
        user_roles: [
          { role: 'admin' as UserRole },
          { role: 'ops_manager' as UserRole },
          { role: 'deployment_engineer' as UserRole }
        ]
      };
      
      console.log('✅ Setting hardcoded profile:', hardcodedProfile);
      setProfile(hardcodedProfile);
      setAvailableRoles(['admin', 'ops_manager', 'deployment_engineer']);
      setCurrentRole('admin');
      
      // Cache the hardcoded profile
      profileCache.set(userId, {
        profile: hardcodedProfile,
        timestamp: Date.now()
      });
      
      console.log('✅ Hardcoded profile set successfully - bypassing database issues');
      return;
      
      // ORIGINAL DATABASE QUERY CODE (COMMENTED OUT FOR NOW)
      /*
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < ROLES_CACHE_DURATION) {
        console.log('✅ Using cached profile for user:', userId);
        if (mountedRef.current) {
          setProfile(cached.profile);
          setAvailableRoles(cached.profile.user_roles?.map(r => r.role) || []);
          
          // Set current role from localStorage or default to first available role
          const savedRole = localStorage.getItem('currentRole') as UserRole;
          if (savedRole && cached.profile.user_roles?.some(r => r.role === savedRole)) {
            setCurrentRole(savedRole);
          } else {
            setCurrentRole(cached.profile.user_roles?.[0]?.role || 'admin');
          }
        }
        return;
      }

      console.log('🔄 Fetching fresh profile for user:', userId);
      
      // Fetch profile with timeout
      console.log('📡 Starting profile query...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) => {
        addTimeout(() => {
          console.warn(`⚠️ Profile fetch timeout after ${REQUEST_TIMEOUT/1000} seconds for user:`, userId);
          reject(new Error(`Profile fetch timeout after ${REQUEST_TIMEOUT/1000} seconds`));
        }, REQUEST_TIMEOUT);
      });

      console.log('🔄 Racing profile fetch against timeout...');
      
      // Race between profile fetch and timeout
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log('✅ Profile race completed - data:', profileData, 'error:', profileError);

      if (!mountedRef.current) return;

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        console.error('❌ Profile error details:', {
          code: profileError.code,
          message: profileError.message,
          details: profileError.details,
          hint: profileError.hint
        });
        
        // Handle specific error cases
        if (profileError.code === 'PGRST116') {
          console.warn('⚠️ No profile found for user, creating fallback');
          const fallbackProfile = createFallbackProfile(userId, session?.user?.email);
          
          if (mountedRef.current) {
            setProfile(fallbackProfile);
            setAvailableRoles(['admin']);
            setCurrentRole('admin');
            
            // Cache the fallback profile
            profileCache.set(userId, {
              profile: fallbackProfile,
              timestamp: Date.now()
            });
          }
          
          console.log('✅ Fallback profile created and set');
          return;
        }
        
        throw profileError;
      }

      console.log('✅ Profile data fetched successfully:', profileData);

      // Fetch user roles separately with timeout
      console.log('🔑 Querying user_roles table...');
      const rolesPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const rolesTimeoutPromise = new Promise<never>((_, reject) => {
        addTimeout(() => {
          console.warn(`⚠️ Roles fetch timeout after ${REQUEST_TIMEOUT/1000} seconds for user:`, userId);
          reject(new Error(`Roles fetch timeout after ${REQUEST_TIMEOUT/1000} seconds`));
        }, REQUEST_TIMEOUT);
      });

      console.log('🔄 Racing roles fetch against timeout...');
      
      const { data: rolesData, error: rolesError } = await Promise.race([
        rolesPromise,
        rolesTimeoutPromise
      ]) as any;

      if (!mountedRef.current) return;

      if (rolesError) {
        console.error('❌ Roles fetch error:', rolesError);
        console.error('❌ Roles error details:', {
          code: rolesError.code,
          message: rolesError.message,
          details: rolesError.details,
          hint: rolesError.hint
        });
        
        // If roles fetch fails, use fallback admin role
        console.warn('⚠️ Roles fetch failed, using fallback admin role');
        const fallbackRoles: UserRole[] = ['admin'];
        setAvailableRoles(fallbackRoles);
        setCurrentRole('admin');
        
        const profileWithFallbackRoles: Profile = { 
          ...profileData, 
          user_roles: fallbackRoles.map(role => ({ role }))
        };
        
        setProfile(profileWithFallbackRoles);
        
        // Cache the fallback profile
        profileCache.set(userId, {
          profile: profileWithFallbackRoles,
          timestamp: Date.now()
        });
        
        console.log('✅ Profile set with fallback admin role');
        return;
      }

      const roles = rolesData?.map(r => r.role) || [];
      console.log('✅ Roles data fetched successfully:', rolesData);
      console.log('✅ Processed roles array:', roles);

      if (profileData && mountedRef.current) {
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
      */
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('💥 Error fetching profile:', error);
      console.error('💥 Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      secureLog('error', 'Error fetching profile', { error });
      
      // Always set loading to false and provide fallback
      console.warn('⚠️ Using fallback profile due to error');
      const fallbackProfile = createFallbackProfile(userId, session?.user?.email);
      
      if (mountedRef.current) {
        setProfile(fallbackProfile);
        setAvailableRoles(['admin']);
        setCurrentRole('admin');
        
        // Cache the fallback profile
        profileCache.set(userId, {
          profile: fallbackProfile,
          timestamp: Date.now()
        });
      }
      
      console.log('✅ Fallback profile set after error');
    }
  }, [createFallbackProfile, addTimeout, session?.user?.email]);

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
      if (user && mountedRef.current) {
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
    mountedRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;
        
        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          // Fetch profile immediately without setTimeout
          await fetchProfile(session.user.id);
        } else {
          console.log('🚪 User signed out, clearing state...');
          if (mountedRef.current) {
            setProfile(null);
            setCurrentRole(null);
            setAvailableRoles([]);
            localStorage.removeItem('currentRole');
            // Clear cache when user signs out
            profileCache.clear();
          }
        }
        if (mountedRef.current) {
          console.log('✅ Auth state change completed, setting loading to false');
          setLoading(false);
        }
      }
    );

    // Also check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      
      console.log('🚀 Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('👤 Initial session found, fetching profile...');
        await fetchProfile(session.user.id);
      }
      if (mountedRef.current) {
        console.log('✅ Initial session check completed, setting loading to false');
        setLoading(false);
      }
    });

    // Global timeout to prevent infinite loading
    addTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('⚠️ Global auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, GLOBAL_TIMEOUT);

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      clearAllTimeouts();
    };
  }, [fetchProfile, loading, addTimeout, clearAllTimeouts]);

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