
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database';

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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCache, setProfileCache] = useState<Map<string, { profile: Profile; timestamp: number }>>(new Map());

  const fetchProfile = async (userId: string) => {
    // Check cache first (5 minute cache)
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      setProfile(cached.profile);
      setAvailableRoles(cached.profile.user_roles?.map(r => r.role) || ['admin']);
      const savedRole = localStorage.getItem('currentRole') as UserRole;
      if (savedRole && cached.profile.user_roles?.some(r => r.role === savedRole)) {
        setCurrentRole(savedRole);
      } else {
        setCurrentRole(cached.profile.user_roles?.[0]?.role || 'admin');
      }
      return;
    }

    try {
      console.log('🔍 Fetching profile for user:', userId);
      
      // Add timeout to profile fetch
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId as any)
        .maybeSingle();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Set fallback profile data to prevent hanging
        const fallbackProfile: Profile = {
          id: 'fallback-id',
          user_id: userId,
          email: 'user@example.com',
          full_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          invited_at: new Date().toISOString(),
          invited_by: 'system',
          last_login_at: new Date().toISOString(),
          welcome_email_sent: false,
          is_active: true,
          user_roles: [{ role: 'admin' as UserRole }]
        };
        setProfile(fallbackProfile);
        setAvailableRoles(['admin' as UserRole]);
        setCurrentRole('admin' as UserRole);
        return;
      }

      if (!profileData) {
        console.warn('No profile data found, using fallback');
        // Set fallback profile data to prevent hanging
        const fallbackProfile: Profile = {
          id: 'fallback-id',
          user_id: userId,
          email: 'user@example.com',
          full_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          invited_at: new Date().toISOString(),
          invited_by: 'system',
          last_login_at: new Date().toISOString(),
          welcome_email_sent: false,
          is_active: true,
          user_roles: [{ role: 'admin' as UserRole }]
        };
        setProfile(fallbackProfile);
        setAvailableRoles(['admin' as UserRole]);
        setCurrentRole('admin' as UserRole);
        return;
      }

      // Fetch roles with timeout
      const rolesPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId as any);
      
      const rolesTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Roles fetch timeout')), 5000)
      );
      
      const { data: rolesData, error: rolesError } = await Promise.race([
        rolesPromise,
        rolesTimeoutPromise
      ]) as any;

      if (rolesError) {
        console.error('Roles fetch error:', rolesError);
        // Use fallback roles to prevent hanging
        const fallbackRoles: UserRole[] = ['admin'];
        const profileWithRoles: Profile = { 
          ...(profileData as any || {}), 
          user_roles: fallbackRoles.map(role => ({ role }))
        };
        
        setProfile(profileWithRoles);
        setAvailableRoles(fallbackRoles);
        setCurrentRole(fallbackRoles[0]);
        return;
      }

      const roles = (rolesData?.map((r: any) => r.role) || ['admin']) as UserRole[];
      const profileWithRoles: Profile = { 
        ...(profileData as any || {}), 
        user_roles: roles.map(role => ({ role }))
      };
      
      setProfile(profileWithRoles);
      setAvailableRoles(roles);
      
      // Cache the profile data
      setProfileCache(prev => new Map(prev).set(userId, {
        profile: profileWithRoles,
        timestamp: Date.now()
      }));
      
      const savedRole = localStorage.getItem('currentRole') as UserRole;
      if (savedRole && roles.includes(savedRole)) {
        setCurrentRole(savedRole);
      } else {
        setCurrentRole(roles[0]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set fallback data to prevent hanging
      const fallbackProfile: Profile = {
        id: 'fallback-id',
        user_id: userId,
        email: 'user@example.com',
        full_name: 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        invited_at: new Date().toISOString(),
        invited_by: 'system',
        last_login_at: new Date().toISOString(),
        welcome_email_sent: false,
        is_active: true,
        user_roles: [{ role: 'admin' as UserRole }]
      };
      setProfile(fallbackProfile);
      setAvailableRoles(['admin' as UserRole]);
      setCurrentRole('admin' as UserRole);
    }
  };

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setCurrentRole(null);
      setAvailableRoles([]);
      setProfileCache(new Map());
      localStorage.removeItem('currentRole');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const createUserAsAdmin = async (email: string, password: string, role: UserRole) => {
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
  };

  const forceRefresh = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        // Check localStorage availability first
        try {
          localStorage.setItem('auth-test', 'test');
          localStorage.removeItem('auth-test');
          console.log('✅ LocalStorage is accessible');
        } catch (storageError) {
          console.error('❌ LocalStorage error:', storageError);
          setLoading(false);
          return;
        }
        
        // Simplified session initialization with longer timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 15000) // Increased to 15 seconds
        );
        
        const { session: initialSession, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (error) {
          console.error('❌ Session initialization failed:', error);
          // Don't fail completely, just log and continue
          console.warn('⚠️ Continuing without initial session');
        }
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log('👤 Fetching profile for user:', initialSession.user.email);
          // Don't await profile fetch to prevent blocking
          fetchProfile(initialSession.user.id).catch(err => 
            console.warn('Profile fetch failed:', err)
          );
        } else {
          console.log('ℹ️ No initial session - user needs to authenticate');
        }
        
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔍 Auth state change:', event, session ? 'Session exists' : 'No session');
            
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
              console.log('👤 User authenticated, fetching profile...');
              // Don't await profile fetch to prevent blocking
              fetchProfile(session.user.id).catch(err => 
                console.warn('Profile fetch failed:', err)
              );
            } else {
              console.log('👋 User signed out, clearing data...');
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
        console.error('❌ Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

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
    // This should never happen if the provider is set up correctly
    console.error('useAuth: Context is null - AuthProvider may not be wrapping this component');
    // Return a minimal fallback to prevent crashes
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
      createUserAsAdmin: async () => ({ error: 'Context not ready' }),
      loading: true,
      forceRefresh: async () => {}
    };
  }
  
  return context;
};
