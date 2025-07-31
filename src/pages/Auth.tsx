import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import smartqLogo from '@/assets/smartq-icon-logo.svg';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [loading, setLoading] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Role@123');
  const [manualLoading, setManualLoading] = useState(false);
  const { signInWithPassword, user } = useAuth();
  const navigate = useNavigate();

  // Try multiple existing user emails
  const defaultEmails = [
    'shivanshu.singh@thesmartq.com',
    'Madhusudhan@thesmartq.com'
  ];

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      return;
    }

    // Auto-login with hardcoded credentials
    const performAutoLogin = async () => {
      if (!autoLoginAttempted) {
        setAutoLoginAttempted(true);
        setLoading(true);
        
        // Try each email until one works
        for (let i = 0; i < defaultEmails.length; i++) {
          try {
            console.log(`Attempting login with: ${defaultEmails[i]}`);
            const { error } = await signInWithPassword(defaultEmails[i]);
            
            if (!error) {
              console.log('Auto-login successful with:', defaultEmails[i]);
              toast.success('Auto-login successful!');
              return; // Success, exit the loop
            } else {
              console.error('Login failed for', defaultEmails[i], ':', error);
              if (i < defaultEmails.length - 1) {
                // Try next email
                continue;
              } else {
                // All emails failed, show manual login
                console.log('All auto-login attempts failed, showing manual login');
                toast.error('Auto-login failed. Please use manual login.');
                setLoading(false);
                setShowManualLogin(true);
              }
            }
          } catch (error) {
            console.error('Auto-login error for', defaultEmails[i], ':', error);
            if (i < defaultEmails.length - 1) {
              continue;
            } else {
              toast.error('Auto-login failed. Please use manual login.');
              setLoading(false);
              setShowManualLogin(true);
            }
          }
        }
      }
    };

    // Attempt auto-login after a short delay
    const timer = setTimeout(performAutoLogin, 500);
    return () => clearTimeout(timer);
  }, [user, navigate, signInWithPassword, autoLoginAttempted]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setManualLoading(true);
    const { error } = await signInWithPassword(email);
    if (error) {
      toast.error(`Login failed: ${error.message}`);
    } else {
      toast.success('Login successful!');
    }
    setManualLoading(false);
  };

  // Show loading state while attempting auto-login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
              <CardTitle className="text-2xl font-bold text-primary">SmartQ Launchpad</CardTitle>
            </div>
            <CardDescription>
              Auto-login in progress...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">
              Attempting to sign in with available accounts...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show manual login form
  if (showManualLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
              <CardTitle className="text-2xl font-bold text-primary">SmartQ Launchpad</CardTitle>
            </div>
            <CardDescription>
              Manual Login Required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Default password: Role@123
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={manualLoading}
              >
                {manualLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p className="mb-2">If you were using magic link authentication:</p>
              <p className="font-mono text-xs bg-muted p-2 rounded">
                You may need to reset your password in Supabase dashboard first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback UI in case auto-login fails
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
            <CardTitle className="text-2xl font-bold text-primary">SmartQ Launchpad</CardTitle>
          </div>
          <CardDescription>
            Auto-login failed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Automatic login failed. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Refresh Page
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;