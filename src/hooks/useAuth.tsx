import { createContext, useContext, useEffect, useState } from 'react';
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
        const roles = rolesData?.map(r => r.role) || ['admin'] as UserRole[];
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
          setCurrentRole(roles[0] || 'admin');
        }
      }
    } catch (error) {
      secureLog('error', 'Error fetching profile', { error });
    }
  };

  const switchRole = (role: UserRole) => {
    if (availableRoles.includes(role)) {
      setCurrentRole(role);
      localStorage.setItem('currentRole', role);
      
      // Redirect to appropriate dashboard based on new role
      // This will be handled by the AuthGuard component
      // We'll trigger a navigation by updating the role
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

  const signInWithOtp = async (email: string) => {
    secureLog('info', 'Starting OTP process', { email });
    
    // Use the new secure function to check if email exists
    const { data: emailExists, error: checkError } = await supabase
      .rpc('check_email_exists', { email_to_check: email });

    secureLog('info', 'Email existence check completed');

    if (checkError) {
      secureLog('error', 'Email check error', { error: checkError });
      return { error: checkError.message || 'Failed to verify email' };
    }

    // If user doesn't exist in profiles table, they shouldn't be able to login
    if (!emailExists) {
      secureLog('warn', 'User not found in profiles table');
      return { 
        error: 'User not found. Please contact your administrator for access.' 
      };
    }

    secureLog('info', 'User verified, proceeding with OTP');

    // User exists, proceed with OTP
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Allow user creation since we've verified they exist in our profiles table
        shouldCreateUser: true,
      },
    });
    
    if (error) {
      secureLog('error', 'OTP sending failed', { error: error.message });
    } else {
      secureLog('info', 'OTP sent successfully');
    }
    return { error: error?.message || null };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    
    return { error: error?.message || null };
  };

  const createUserAsAdmin = async (email: string, password: string, role: UserRole) => {
    // This function should only be called by admin users
    // It creates a new user with the specified role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for B2B
    });

    if (error) {
      return { error: error.message };
    }

    if (data.user) {
      // Assign role to the new user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: role
        });

      if (roleError) {
        return { error: roleError.message };
      }

      // Create profile for the new user
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          full_name: email.split('@')[0], // Default name from email
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        return { error: profileError.message };
      }
    }

    return { error: null };
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
    signInWithOtp,
    verifyOtp,
    createUserAsAdmin,
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