// Test script to verify Sites backend integration
// Run this in your browser console after implementing the changes

console.log('Testing Sites Backend Integration...');

// Test 1: Check if SitesService is available
if (typeof SitesService !== 'undefined') {
  console.log('✅ SitesService is available');
} else {
  console.log('❌ SitesService is not available');
}

// Test 2: Test getAllSites method
async function testGetAllSites() {
  try {
    console.log('Testing getAllSites...');
    const sites = await SitesService.getAllSites();
    console.log('✅ getAllSites returned:', sites.length, 'sites');
    
    if (sites.length > 0) {
      const firstSite = sites[0];
      console.log('First site data:', {
        name: firstSite.name,
        status: firstSite.status,
        ops_manager: firstSite.assigned_ops_manager,
        deployment_engineer: firstSite.assigned_deployment_engineer
      });
      
      // Check if we're getting actual names instead of UUIDs
      const hasRealNames = sites.some(site => 
        site.assigned_ops_manager !== 'Unassigned' && 
        site.assigned_deployment_engineer !== 'Unassigned' &&
        !site.assigned_ops_manager.includes('-') && // UUIDs contain hyphens
        !site.assigned_deployment_engineer.includes('-')
      );
      
      if (hasRealNames) {
        console.log('✅ Sites have real user names assigned');
      } else {
        console.log('❌ Sites still have UUIDs or "Unassigned" values');
      }
    }
  } catch (error) {
    console.error('❌ Error testing getAllSites:', error);
  }
}

// Test 3: Test getAllUsers method
async function testGetAllUsers() {
  try {
    console.log('Testing getAllUsers...');
    const users = await SitesService.getAllUsers();
    console.log('✅ getAllUsers returned:', users.length, 'users');
    
    if (users.length > 0) {
      console.log('Sample users:', users.slice(0, 3));
    }
  } catch (error) {
    console.error('❌ Error testing getAllUsers:', error);
  }
}

// Test 4: Check database connection
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Sites Backend Integration Tests...\n');
  
  await testDatabaseConnection();
  console.log('');
  
  await testGetAllSites();
  console.log('');
  
  await testGetAllUsers();
  console.log('');
  
  console.log('🏁 Tests completed!');
}

// Run tests if we're in a browser environment
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
} else {
  console.log('This script is designed to run in a browser environment');
}

// Manual test function for developers
window.testSitesBackend = runAllTests;
console.log('💡 Run testSitesBackend() in console to test the integration');
