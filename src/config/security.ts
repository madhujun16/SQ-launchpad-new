// Security Configuration
// Centralized security settings for the application

export const SECURITY_CONFIG = {
  // Debug logging control
  ENABLE_DEBUG_LOGS: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
  ENABLE_AUDIT_LOGS: import.meta.env.VITE_ENABLE_AUDIT_LOGS === 'true',
  
  // Session security
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  STORAGE_KEY: 'smartq-launchpad-auth',
  
  // API security
  MAX_RETRY_ATTEMPTS: 3,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // Content Security Policy
  CSP: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", "data:", "https:"],
    'connect-src': ["'self'", "https://*.supabase.co", "https://*.googleapis.com"],
    'frame-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  },
  
  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 15 * 60 * 1000 // 15 minutes
  }
};

// Security utility functions
export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Secure logging function
export const secureLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  if (SECURITY_CONFIG.ENABLE_DEBUG_LOGS) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      data: data ? JSON.stringify(data) : undefined
    };
    
    switch (level) {
      case 'info':
        console.info(`[${timestamp}] INFO: ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`[${timestamp}] WARN: ${message}`, data || '');
        break;
      case 'error':
        console.error(`[${timestamp}] ERROR: ${message}`, data || '');
        break;
    }
  }
  
  // In production, send to secure logging service
  if (SECURITY_CONFIG.ENABLE_AUDIT_LOGS) {
    // TODO: Implement secure logging service
    // sendToAuditLog(level, message, data);
  }
};
