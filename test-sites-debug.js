// Simple test script to debug sites issue
const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSites() {
  console.log('Testing sites query...');
  
  try {
    // Test 1: Simple query without join
    console.log('\n1. Testing simple sites query...');
    const { data: simpleData, error: simpleError } = await supabase
      .from('sites')
      .select('*')
      .limit(5);
    
    if (simpleError) {
      console.error('Simple query error:', simpleError);
    } else {
      console.log('Simple query result:', simpleData?.length || 0, 'sites');
      if (simpleData && simpleData.length > 0) {
        console.log('First site:', {
          id: simpleData[0].id,
          name: simpleData[0].name,
          organization_id: simpleData[0].organization_id,
          organization_name: simpleData[0].organization_name,
          status: simpleData[0].status
        });
      }
    }

    // Test 2: Query with organization join
    console.log('\n2. Testing sites query with organization join...');
    const { data: joinData, error: joinError } = await supabase
      .from('sites')
      .select(`
        *,
        organization:organizations(name, logo_url)
      `)
      .limit(5);
    
    if (joinError) {
      console.error('Join query error:', joinError);
    } else {
      console.log('Join query result:', joinData?.length || 0, 'sites');
      if (joinData && joinData.length > 0) {
        console.log('First site with organization:', {
          id: joinData[0].id,
          name: joinData[0].name,
          organization: joinData[0].organization,
          organization_name: joinData[0].organization_name
        });
      }
    }

    // Test 3: Check organizations table
    console.log('\n3. Testing organizations table...');
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .limit(5);
    
    if (orgError) {
      console.error('Organizations query error:', orgError);
    } else {
      console.log('Organizations result:', orgData?.length || 0, 'organizations');
      if (orgData && orgData.length > 0) {
        console.log('First organization:', {
          id: orgData[0].id,
          name: orgData[0].name,
          logo_url: orgData[0].logo_url
        });
      }
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testSites();
