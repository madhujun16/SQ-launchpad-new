import { createContext, useContext, useEffect, useState } from 'react';
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
  sendMagicLink: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (profileData) {
        const roles = rolesData?.map(r => r.role) || ['user'] as UserRole[];
        setProfile({ 
          ...profileData, 
          user_roles: rolesData?.map(r => ({ role: r.role })) || []
        });
        setAvailableRoles(roles);
        
        // Set current role from localStorage or default to first available role
        const savedRole = localStorage.getItem('currentRole') as UserRole;
        if (savedRole && roles.includes(savedRole)) {
          setCurrentRole(savedRole);
        } else {
          setCurrentRole(roles[0] || 'user');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setCurrentRole(null);
          setAvailableRoles([]);
          localStorage.removeItem('currentRole');
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (email: string) => {
    console.log('Attempting to send magic link for email:', email);
    
    // For invite-only platform, directly attempt to send magic link
    // Supabase will handle checking if user exists
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: false // Don't create new users since this is invite-only
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    setCurrentRole(null);
    setAvailableRoles([]);
    localStorage.removeItem('currentRole');
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    currentRole,
    availableRoles,
    switchRole,
    signOut,
    sendMagicLink,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};