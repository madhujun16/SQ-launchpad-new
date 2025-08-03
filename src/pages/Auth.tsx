import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import smartqLogo from '@/assets/smartq-icon-logo.svg';
import { Mail, Key, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const { error } = await signInWithOtp(email);
    
    if (error) {
      if (error.message.includes('User not found')) {
        toast.error('No account found with this email. Please contact your administrator.');
      } else {
        toast.error(`Failed to send OTP: ${error.message}`);
      }
    } else {
      toast.success('OTP sent to your email! Please check your inbox.');
      setOtpSent(true);
      setCountdown(60); // 60 second cooldown
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) {
      toast.error('Please enter the OTP code');
      return;
    }

    setLoading(true);
    const { error } = await verifyOtp(email, otpToken);
    
    if (error) {
      if (error.message.includes('Invalid OTP')) {
        toast.error('Invalid OTP code. Please check and try again.');
      } else if (error.message.includes('expired')) {
        toast.error('OTP has expired. Please request a new one.');
      } else {
        toast.error(`Verification failed: ${error.message}`);
      }
    } else {
      toast.success('Login successful!');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      toast.error(`Please wait ${countdown} seconds before requesting a new OTP`);
      return;
    }

    setLoading(true);
    const { error } = await signInWithOtp(email);
    
    if (error) {
      toast.error(`Failed to resend OTP: ${error.message}`);
    } else {
      toast.success('New OTP sent to your email!');
      setCountdown(60);
    }
    setLoading(false);
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpToken('');
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 bg-card shadow-soft">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src={smartqLogo} alt="SmartQ Launchpad" className="h-12 w-12" />
            <CardTitle className="text-2xl font-bold text-primary-dark">SmartQ Launchpad</CardTitle>
          </div>
          <CardDescription>
            {otpSent ? 'Enter OTP Code' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {otpSent ? (
            // OTP Verification Form
            <div className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Mail className="h-4 w-4 text-primary" />
                <AlertDescription>
                  We've sent a one-time code to <strong className="text-primary-dark">{email}</strong>
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-primary-dark">OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    maxLength={6}
                    required
                    className="text-center text-lg tracking-widest border-primary/30 focus:border-primary"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark shadow-soft" 
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </form>
              
              <div className="text-center space-y-2">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary-dark hover:text-primary"
                >
                  {countdown > 0 
                    ? `Resend OTP in ${countdown}s` 
                    : 'Resend OTP'
                  }
                </Button>
                
                <div>
                  <Button
                    variant="ghost"
                    onClick={handleBackToEmail}
                    className="text-sm text-primary-dark hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Email
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Email Input Form
            <div className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <Key className="h-4 w-4 text-primary" />
                <AlertDescription>
                  This is a B2B application. Please contact your administrator if you need access.
                </AlertDescription>
              </Alert>
              
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-primary-dark">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-dark shadow-soft" 
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  We'll send a one-time code to your email address for secure login.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;