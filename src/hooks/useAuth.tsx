
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

// Debug: Log context creation
console.log('🔧 AuthContext created:', AuthContext);

// Cache for user profiles and roles
const profileCache = new Map<string, { profile: Profile; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Constants - reduced timeouts to prevent hanging
const REQUEST_TIMEOUT = 15000; // 15 seconds
const GLOBAL_TIMEOUT = 20000; // 20 seconds

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

  // Simplified fetch function with better error handling
  const fetchProfile = useCallback(async (userId: string) => {
    if (!mountedRef.current) return;

    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('✅ Using cached profile data');
        if (mountedRef.current) {
          setProfile(cached.profile);
          setAvailableRoles(cached.profile.user_roles.map(r => r.role));
          setCurrentRole(cached.profile.user_roles[0]?.role || 'admin');
        }
        return;
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        addTimeout(() => {
          reject(new Error(`Profile fetch timeout after ${REQUEST_TIMEOUT/1000} seconds`));
        }, REQUEST_TIMEOUT);
      });

      // Fetch profile with timeout
      console.log('📡 Starting profile query...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('🔄 Racing profile fetch against timeout...');
      
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      console.log('✅ Profile race completed - data:', profileData, 'error:', profileError);

      if (!mountedRef.current) return;

      if (profileError) {
        console.warn('⚠️ Profile fetch error:', profileError.message);
        throw profileError;
      }

      if (!profileData) {
        console.warn('⚠️ No profile found for user');
        throw new Error('No profile found');
      }

      console.log('✅ Profile data fetched successfully:', profileData);

      // Fetch user roles with timeout
      const rolesPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const rolesTimeoutPromise = new Promise<never>((_, reject) => {
        addTimeout(() => {
          reject(new Error(`Roles fetch timeout after ${REQUEST_TIMEOUT/1000} seconds`));
        }, REQUEST_TIMEOUT);
      });

      const { data: rolesData, error: rolesError } = await Promise.race([
        rolesPromise,
        rolesTimeoutPromise
      ]) as any;

      if (!mountedRef.current) return;

      if (rolesError) {
        console.warn('⚠️ Roles fetch error:', rolesError.message);
        throw rolesError;
      }

      if (!rolesData || rolesData.length === 0) {
        console.warn('⚠️ No roles found for user, creating default admin role');
        // Instead of throwing an error, create a default admin role
        const defaultRole = 'admin' as UserRole;
        const roles = [defaultRole];
        
        // Insert the default role into the database
        try {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role: defaultRole });
          
          if (insertError) {
            console.warn('⚠️ Could not insert default role:', insertError.message);
          } else {
            console.log('✅ Default admin role created for user');
          }
        } catch (insertError) {
          console.warn('⚠️ Error inserting default role:', insertError);
        }
        
        console.log('✅ Using default admin role');
        return roles;
      }

      const roles = rolesData.map(r => r.role);
      console.log('✅ Roles fetched successfully:', roles);

      const profileWithRoles: Profile = { 
        ...profileData, 
        user_roles: roles.map(role => ({ role }))
      };
      
      if (mountedRef.current) {
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
          setCurrentRole(savedRole);
        } else {
          setCurrentRole(roles[0]);
        }
        
        console.log('✅ Profile setup completed successfully');
      }
    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('💥 Error fetching profile:', error);
      // Create a fallback profile to prevent app crash
      const fallbackProfile: Profile = {
        id: userId,
        user_id: userId,
        full_name: 'User',
        email: 'user@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invited_at: new Date().toISOString(),
        invited_by: 'system',
        last_login_at: new Date().toISOString(),
        welcome_email_sent: false,
        user_roles: [{ role: 'admin' as UserRole }]
      };
      
      if (mountedRef.current) {
        setProfile(fallbackProfile);
        setAvailableRoles(['admin']);
        setCurrentRole('admin');
        
        // Cache the fallback profile
        profileCache.set(userId, {
          profile: fallbackProfile,
          timestamp: Date.now()
        });
        
        console.log('✅ Fallback profile created to prevent app crash');
      }
    }
  }, [addTimeout]);

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
      console.log('🔄 Force refreshing authentication data...');
      profileCache.clear();
      localStorage.removeItem('currentRole');
      
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
    let authSubscription: any;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mountedRef.current) return;
        
        console.log('🚀 Initial session check:', initialSession?.user?.id);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mountedRef.current) return;
            
            console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              await fetchProfile(session.user.id);
            } else {
              if (mountedRef.current) {
                setProfile(null);
                setCurrentRole(null);
                setAvailableRoles([]);
                localStorage.removeItem('currentRole');
                profileCache.clear();
              }
            }
            
            if (mountedRef.current) {
              setLoading(false);
            }
          }
        );
        
        authSubscription = subscription;
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Global timeout to prevent infinite loading
    const globalTimeout = addTimeout(() => {
      if (mountedRef.current && loading) {
        console.warn('⚠️ Global auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, GLOBAL_TIMEOUT);

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
      clearAllTimeouts();
    };
  }, [fetchProfile, addTimeout, clearAllTimeouts]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  console.log('🔧 useAuth hook called, AuthContext:', AuthContext);
  
  // Check if we're in a React component context
  if (typeof window !== 'undefined' && !window.React) {
    console.error('useAuth: React not available in window context');
    return getDefaultAuthContext();
  }

  try {
    console.log('🔧 Attempting to use useContext with AuthContext:', AuthContext);
    const context = useContext(AuthContext);
    console.log('🔧 useContext result:', context);
    
    // Additional safety check for context
    if (!context || context === undefined) {
      console.error('useAuth must be used within an AuthProvider');
      return getDefaultAuthContext();
    }
    
    return context;
  } catch (error) {
    console.error('useAuth hook error:', error);
    return getDefaultAuthContext();
  }
};

// Helper function to get default auth context
const getDefaultAuthContext = () => ({
  user: null,
  session: null,
  profile: null,
  currentRole: null,
  availableRoles: [],
  switchRole: () => {},
  signOut: async () => {},
  signInWithOtp: async () => ({ error: 'Context not available' }),
  verifyOtp: async () => ({ error: 'Context not available' }),
  createUserAsAdmin: async () => ({ error: 'Context not available' }),
  loading: true,
  forceRefresh: async () => {}
});
