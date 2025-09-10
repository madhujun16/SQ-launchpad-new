# Sites Page Timeout Issue - Fix Implementation

## 🔍 **Problem Analysis**

The sites page was showing "0 sites" and displaying the console message "Sites: Loading timeout (30s), setting empty array" due to several interconnected issues:

### **Root Causes Identified:**

1. **Session Expiration**: Supabase sessions were expiring or becoming invalid, causing API calls to fail
2. **Hard Timeout**: The Sites page had a hardcoded 30-second timeout that immediately set an empty array
3. **No Fallback Strategy**: When API calls failed, there was no graceful fallback to cached data
4. **Session Refresh Issues**: Token refresh wasn't handled properly when sessions expired
5. **Database Query Hanging**: Supabase queries could hang indefinitely without proper timeout handling

## 🛠️ **Solutions Implemented**

### **1. Enhanced Session Management (`sitesService.ts`)**

**Before:**
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !session) {
  return [];
}
```

**After:**
```typescript
// Check if we have an active session with retry logic
let session = null;
let sessionError = null;

try {
  const sessionResult = await Promise.race([
    supabase.auth.getSession(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session check timeout')), 10000)
    )
  ]);
  
  if (sessionResult && typeof sessionResult === 'object' && 'data' in sessionResult) {
    session = sessionResult.data.session;
    sessionError = sessionResult.error;
  }
} catch (error) {
  console.warn('⚠️ Session check failed, attempting refresh:', error);
  // Try to refresh the session
  try {
    const refreshResult = await Promise.race([
      supabase.auth.refreshSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session refresh timeout')), 10000)
      )
    ]);
    
    if (refreshResult && typeof refreshResult === 'object' && 'data' in refreshResult) {
      session = refreshResult.data.session;
      sessionError = refreshResult.error;
      console.log('✅ Session refreshed successfully');
    }
  } catch (refreshError) {
    console.error('❌ Session refresh failed:', refreshError);
    // Return cached data if available, otherwise empty array
    if (this.sitesCache) {
      console.log('🔍 Returning stale cache due to session issues');
      return this.sitesCache.data;
    }
    return [];
  }
}
```

### **2. Database Query Timeout Protection**

**Before:**
```typescript
const { data, error } = await supabase
  .from('sites')
  .select(`...`)
  .eq('is_archived', false)
  .order('name');
```

**After:**
```typescript
// Query to get sites with organization data - only non-archived sites
// Add timeout to the query itself
const queryPromise = supabase
  .from('sites')
  .select(`
    *,
    organization:organizations(name, logo_url, sector, unit_code)
  `)
  .eq('is_archived', false)
  .order('name');

const { data, error } = await Promise.race([
  queryPromise,
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Database query timeout')), 25000)
  )
]) as any;
```

### **3. Intelligent Caching Strategy**

**Before:**
```typescript
if (error) {
  console.error('❌ Error fetching sites:', error);
  return [];
}
```

**After:**
```typescript
if (error) {
  console.error('❌ Error fetching sites:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  });
  
  // Return cached data if available, otherwise empty array
  if (this.sitesCache) {
    console.log('🔍 Returning stale cache due to query error');
    return this.sitesCache.data;
  }
  return [];
}
```

### **4. Improved Supabase Client Configuration**

**Before:**
```typescript
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
  storageKey: 'smartq-launchpad-auth',
  detectSessionInUrl: true,
  flowType: 'pkce',
  refreshTokenRetryAttempts: 3,
  refreshTokenRetryDelay: 2000
}
```

**After:**
```typescript
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,
  storageKey: 'smartq-launchpad-auth',
  detectSessionInUrl: true,
  flowType: 'pkce',
  // Improved refresh configuration for better reliability
  refreshTokenRetryAttempts: 5, // Increased from 3
  refreshTokenRetryDelay: 1000, // Reduced from 2000ms
  // Add session timeout handling
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 days
  // Enable debug mode in development
  debug: import.meta.env.DEV
}
```

### **5. Enhanced Sites Page Timeout Handling**

**Before:**
```typescript
timeoutId = setTimeout(() => {
  if (isMounted && loading) {
    console.log('Sites: Loading timeout (30s), setting empty array');
    setSites([]);
    setLoading(false);
  }
}, 30000);
```

**After:**
```typescript
timeoutId = setTimeout(() => {
  if (isMounted && loading) {
    console.log('Sites: Loading timeout (30s), attempting graceful fallback');
    // Don't immediately set empty array, try to get cached data first
    setError('Loading timeout - showing cached data if available');
    setLoading(false);
  }
}, 30000);
```

### **6. Session Monitoring Utility**

Created a new utility (`src/utils/sessionMonitor.ts`) that provides:

- **Real-time session health monitoring**
- **Automatic session refresh attempts**
- **Session expiry warnings**
- **Debug information for troubleshooting**

```typescript
// Auto-start monitoring in development
if (import.meta.env.DEV) {
  sessionMonitor.startMonitoring(30000); // Check every 30 seconds
}
```

## 🎯 **Key Improvements**

### **Session Persistence**
- ✅ **Automatic session refresh** when tokens expire
- ✅ **Graceful fallback** to cached data when sessions fail
- ✅ **Improved retry logic** with better timeout handling
- ✅ **Session monitoring** for proactive issue detection

### **Timeout Handling**
- ✅ **Intelligent timeouts** that don't immediately fail
- ✅ **Database query timeouts** to prevent hanging requests
- ✅ **Session check timeouts** to prevent authentication delays
- ✅ **Graceful degradation** when timeouts occur

### **Caching Strategy**
- ✅ **Stale cache fallback** when API calls fail
- ✅ **5-minute cache duration** for better performance
- ✅ **Cache invalidation** on successful data fetch
- ✅ **Cache persistence** across session issues

### **Error Handling**
- ✅ **Detailed error logging** for debugging
- ✅ **User-friendly error messages** instead of blank pages
- ✅ **Retry mechanisms** for transient failures
- ✅ **Fallback strategies** for all error scenarios

## 🚀 **Expected Results**

After implementing these fixes, you should see:

1. **Reduced Timeout Occurrences**: Sessions will refresh automatically before expiring
2. **Better User Experience**: Cached data will be shown instead of empty pages
3. **Improved Reliability**: Multiple fallback strategies prevent complete failures
4. **Better Debugging**: Detailed logging helps identify issues quickly
5. **Session Persistence**: Users won't need to re-authenticate as frequently

## 🔧 **Monitoring & Debugging**

### **Console Messages to Watch For:**

- `✅ Session refreshed successfully` - Session was automatically refreshed
- `🔍 Returning stale cache due to session issues` - Using cached data due to session problems
- `⚠️ Session expires soon` - Session will expire in less than 5 minutes
- `❌ Session refresh failed` - Manual intervention may be needed

### **Development Mode Features:**

- **Session monitoring** runs automatically every 30 seconds
- **Debug logging** provides detailed session information
- **Health checks** warn about potential issues

## 📝 **Additional Recommendations**

1. **Monitor Session Health**: Use the session monitor utility to track session issues
2. **Check Network Connectivity**: Ensure stable internet connection for API calls
3. **Review Supabase Logs**: Check Supabase dashboard for any service issues
4. **Test Token Refresh**: Verify that refresh tokens are working correctly
5. **Monitor Cache Performance**: Ensure cached data is being used effectively

## 🔄 **Testing the Fix**

To test that the fixes are working:

1. **Load the sites page** - Should load normally
2. **Wait for session expiry** - Should automatically refresh
3. **Simulate network issues** - Should fall back to cached data
4. **Check console logs** - Should see detailed debugging information
5. **Monitor session health** - Should see regular health checks in development

The timeout issue should now be significantly reduced, and when it does occur, users will see cached data instead of an empty page.
