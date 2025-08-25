// Test script for Supabase storage bucket
// Run this in your browser console or as a Node.js script

const SUPABASE_URL = 'https://ngzvoekvwgjinagdvdhf.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'; // Replace with your actual anon key

// Test 1: Check if bucket exists
async function testBucketExists() {
  try {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      const buckets = await response.json();
      console.log('✅ Available buckets:', buckets);
      const siteLayoutBucket = buckets.find(b => b.name === 'site-layout-images');
      if (siteLayoutBucket) {
        console.log('✅ site-layout-images bucket found:', siteLayoutBucket);
      } else {
        console.log('❌ site-layout-images bucket NOT found');
      }
    } else {
      console.log('❌ Failed to list buckets:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error testing bucket existence:', error);
  }
}

// Test 2: Try to upload a test file (if bucket exists)
async function testFileUpload() {
  try {
    // Create a simple test file
    const testContent = 'This is a test file for storage bucket verification';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    const formData = new FormData();
    formData.append('file', testFile);
    
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-layout-images/test-upload.txt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: formData
    });
    
    if (response.ok) {
      console.log('✅ Test file upload successful');
      const result = await response.json();
      console.log('Upload result:', result);
    } else {
      console.log('❌ Test file upload failed:', response.status, response.statusText);
      const error = await response.text();
      console.log('Error details:', error);
    }
  } catch (error) {
    console.error('❌ Error testing file upload:', error);
  }
}

// Test 3: Check storage policies
async function testStoragePolicies() {
  try {
    // Test public read access
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/site-layout-images/test-upload.txt`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY
      }
    });
    
    if (response.ok) {
      console.log('✅ Public read access working');
    } else {
      console.log('❌ Public read access failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing storage policies:', error);
  }
}

// Run all tests
console.log('🚀 Starting Supabase Storage Tests...');
console.log('=====================================');

// Note: You'll need to replace YOUR_ANON_KEY_HERE with your actual Supabase anon key
// You can find this in your Supabase dashboard under Settings > API

// Uncomment these lines after adding your anon key:
// testBucketExists();
// testFileUpload();
// testStoragePolicies();

console.log('📝 To run tests:');
console.log('1. Replace YOUR_ANON_KEY_HERE with your actual Supabase anon key');
console.log('2. Uncomment the test function calls above');
console.log('3. Run this script in your browser console or as a Node.js script');
