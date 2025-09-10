// Session monitoring utility for debugging authentication issues
import { supabase } from '@/integrations/supabase/client';

export class SessionMonitor {
  private static instance: SessionMonitor;
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.log('Session monitoring already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting session monitoring...');

    this.checkInterval = setInterval(async () => {
      await this.checkSessionHealth();
    }, intervalMs);

    // Initial check
    this.checkSessionHealth();
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('🔍 Session monitoring stopped');
  }

  private async checkSessionHealth(): Promise<void> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('⚠️ Session health check failed:', error);
        return;
      }

      if (!session) {
        console.warn('⚠️ No active session detected');
        return;
      }

      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry < 0) {
        console.warn('⚠️ Session has expired');
      } else if (timeUntilExpiry < 5 * 60 * 1000) { // Less than 5 minutes
        console.warn('⚠️ Session expires soon:', Math.round(timeUntilExpiry / 1000), 'seconds');
      } else {
        console.log('✅ Session healthy, expires in:', Math.round(timeUntilExpiry / 1000), 'seconds');
      }

      // Check if refresh token is available
      if (!session.refresh_token) {
        console.warn('⚠️ No refresh token available');
      }

    } catch (error) {
      console.error('❌ Session health check error:', error);
    }
  }

  async forceRefreshSession(): Promise<boolean> {
    try {
      console.log('🔄 Attempting to refresh session...');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
        return false;
      }

      if (data.session) {
        console.log('✅ Session refreshed successfully');
        return true;
      } else {
        console.warn('⚠️ No session returned after refresh');
        return false;
      }
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      return false;
    }
  }

  async getSessionInfo(): Promise<{
    hasSession: boolean;
    expiresAt?: number;
    timeUntilExpiry?: number;
    hasRefreshToken: boolean;
    userId?: string;
  }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return {
          hasSession: false,
          hasRefreshToken: false
        };
      }

      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      const timeUntilExpiry = expiresAt - now;

      return {
        hasSession: true,
        expiresAt,
        timeUntilExpiry,
        hasRefreshToken: !!session.refresh_token,
        userId: session.user?.id
      };
    } catch (error) {
      console.error('❌ Error getting session info:', error);
      return {
        hasSession: false,
        hasRefreshToken: false
      };
    }
  }
}

// Export singleton instance
export const sessionMonitor = SessionMonitor.getInstance();

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  sessionMonitor.startMonitoring(30000); // Check every 30 seconds
}
