import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import smartqLogo from '@/assets/smartq-icon-logo.svg';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendMagicLink, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await sendMagicLink(email);
    if (error) {
      if (error.code === 'email_not_registered') {
        toast.error(error.message);
      } else {
        toast.error('Failed to send magic link. Please try again.');
      }
    } else {
      setEmailSent(true);
    }
    setLoading(false);
  };

  const handleBackToEmail = () => {
    setEmailSent(false);
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
            <CardTitle className="text-2xl font-bold text-primary">SmartQ Launchpad</CardTitle>
          </div>
          <CardDescription>
            {!emailSent 
              ? 'Enter your email to receive a magic link'
              : 'Check your email for the magic link'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleSendMagicLink} className="space-y-4">
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
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Sending magic link...' : 'Send Magic Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  We've sent a magic link to:
                </p>
                <p className="font-medium">{email}</p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Click the link in your email to sign in. The link will expire in 1 hour.
              </p>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBackToEmail}
                disabled={loading}
              >
                Use different email
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Contact your administrator if you need an account or have trouble accessing the system.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;