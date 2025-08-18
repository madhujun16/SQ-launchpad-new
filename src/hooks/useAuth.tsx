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
      // Check cache first
      const cached = profileCache.get(userId);
      if (cached && Date.now() - cached.timestamp < ROLES_CACHE_DURATION) {
        console.log('Using cached profile for user:', userId);
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

      console.log('Fetching profile for user:', userId);
      
      // Batch fetch profile and roles in a single query using joins
      const { data: profileData, error: profileError } = await supabaseCached
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);

      if (profileData) {
        const roles = profileData.user_roles?.map(r => r.role) || [];
        console.log('Processed roles:', roles);
        
        // Only users with assigned roles in the database can access the system
        if (roles.length === 0) {
          console.error('No roles found for user - access denied');
          setProfile(null);
          setCurrentRole(null);
          setAvailableRoles([]);
          return;
        }
        
        const profileWithRoles = { 
          ...profileData, 
          user_roles: profileData.user_roles?.map(r => ({ role: r.role })) || []
        };
        
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
          console.log('Setting saved role:', savedRole);
          setCurrentRole(savedRole);
        } else {
          console.log('Setting default role:', roles[0]);
          setCurrentRole(roles[0] || 'admin');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    loading
  }), [
    user, session, profile, currentRole, availableRoles,
    switchRole, signOut, signInWithOtp, verifyOtp, createUserAsAdmin, loading
  ]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch profile immediately without setTimeout
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setCurrentRole(null);
          setAvailableRoles([]);
          localStorage.removeItem('currentRole');
          // Clear cache when user signs out
          profileCache.clear();
        }
        setLoading(false);
      }
    );

    // Also check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
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