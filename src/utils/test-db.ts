import { supabase } from '@/integrations/supabase/client';

export const testDatabase = async () => {
  console.log('=== Testing Database Connectivity ===');
  
  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('Database connectivity test:', { data, error });
    
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    console.log('Profiles count:', profiles?.length || 0);
    console.log('Profiles error:', profilesError);
    
    if (profiles && profiles.length > 0) {
      console.log('Sample profile:', profiles[0]);
    }
    
    // Test user_roles table
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*');
    
    console.log('User roles count:', userRoles?.length || 0);
    console.log('User roles error:', userRolesError);
    
    if (userRoles && userRoles.length > 0) {
      console.log('Sample user role:', userRoles[0]);
    }
    
    // Test admin query
    const { data: adminQuery, error: adminQueryError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles (
          role
        )
      `);
    
    console.log('Admin query result:', { 
      count: adminQuery?.length || 0, 
      error: adminQueryError 
    });
    
    if (adminQuery && adminQuery.length > 0) {
      console.log('Sample admin query result:', adminQuery[0]);
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
};

// Export for use in browser console
(window as any).testDatabase = testDatabase; 