import { supabase } from '@/integrations/supabase/client';

export const debugAuth = async () => {
  console.log('=== Debugging Auth ===');
  
  // Check profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');
  
  console.log('Profiles in database:', profiles);
  console.log('Profiles error:', profilesError);
  
  // Check user_roles table
  const { data: userRoles, error: userRolesError } = await supabase
    .from('user_roles')
    .select('*');
  
  console.log('User roles in database:', userRoles);
  console.log('User roles error:', userRolesError);
  
  // Test OTP for a specific email
  const testEmail = 'admin@smartq.com'; // Replace with actual test email
  console.log('Testing OTP for:', testEmail);
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', testEmail)
    .single();
  
  console.log('Profile check for test email:', { profileData, profileError });
  
  // Test admin user management query
  console.log('=== Testing Admin User Management ===');
  
  const { data: adminUsersData, error: adminUsersError } = await supabase
    .from('profiles')
    .select(`
      *,
      user_roles (
        role
      )
    `);
  
  console.log('Admin users query result:', { adminUsersData, adminUsersError });
  
  // Test if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  if (user) {
    const { data: currentUserRoles, error: currentUserRolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    console.log('Current user roles:', { currentUserRoles, currentUserRolesError });
  }
};

// Call the debug function
debugAuth(); 