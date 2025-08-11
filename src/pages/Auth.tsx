import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';

const Auth = () => {
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useIsMobile();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Sending OTP to:', email); // Debug log

    const { error } = await signInWithOtp(email);

    if (error) {
      console.error('OTP Error:', error); // Debug log
      setError(error.message || 'Failed to send OTP');
      toast.error('Failed to send OTP');
    } else {
      setOtpSent(true);
      toast.success('OTP sent to your email');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await verifyOtp(email, otp);

    if (error) {
      setError(error.message || 'Invalid OTP');
      toast.error('Invalid OTP');
    } else {
      toast.success('Login successful');
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
  };

  return (
    <div className={`
      min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-blue-50 to-indigo-100 
      p-4 sm:p-6
    `}>
      <Card className={`
        w-full shadow-xl
        ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-md' : 'max-w-md'}
      `}>
        <CardHeader className={`
          text-center space-y-2
          ${isMobile ? 'p-4' : 'p-6'}
        `}>
          <div className={`
            mx-auto bg-blue-600 rounded-full flex items-center justify-center
            ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
          `}>
            <RocketIcon className={`
              text-white
              ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}
            `} />
          </div>
          <CardTitle className={`
            font-bold text-gray-900
            ${isMobile ? 'text-xl' : 'text-2xl'}
          `}>
            {otpSent ? 'Enter OTP' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className={`
            text-gray-600
            ${isMobile ? 'text-sm' : 'text-base'}
          `}>
            {otpSent 
              ? 'We\'ve sent a one-time code to your email'
              : 'Sign in to your account using your email'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className={`
          ${isMobile ? 'px-4 pb-4' : 'px-6 pb-6'}
        `}>
          {otpSent ? (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp" className={`
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  One-Time Code
                </Label>
                <div className="relative">
                  <Lock className={`
                    absolute left-3 top-3 text-gray-400
                    ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}
                  `} />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`
                      pl-10
                      ${isMobile ? 'h-11 text-base' : 'h-12 text-base'}
                      touch-manipulation
                    `}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`
                  w-full shadow-soft rounded-lg
                  ${isMobile ? 'h-11 text-base' : 'h-12 text-base'}
                  active:scale-95 transition-transform
                  touch-manipulation
                `}
                variant="default"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToEmail}
                  className={`
                    text-gray-500 hover:text-gray-700
                    ${isMobile ? 'text-sm h-10' : 'text-base h-11'}
                    active:scale-95 transition-transform
                  `}
                >
                  <ArrowLeft className={`
                    mr-1
                    ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}
                  `} />
                  Back to email
                </Button>
              </div>

              <div className={`
                text-center text-muted-foreground
                ${isMobile ? 'text-xs' : 'text-sm'}
              `}>
                <p>
                  Didn't receive the code? Check your spam folder or try again.
                </p>
              </div>
            </form>
          ) : (
            // Email Input Form
            <form onSubmit={handleSendOtp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className={`
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`
                    absolute left-3 top-3 text-gray-400
                    ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}
                  `} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`
                      pl-10
                      ${isMobile ? 'h-11 text-base' : 'h-12 text-base'}
                      touch-manipulation
                    `}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`
                  w-full shadow-soft rounded-lg
                  ${isMobile ? 'h-11 text-base' : 'h-12 text-base'}
                  active:scale-95 transition-transform
                  touch-manipulation
                `}
                variant="default"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>

              <div className={`
                text-center text-muted-foreground
                ${isMobile ? 'text-xs' : 'text-sm'}
              `}>
                <p>
                  We'll send a one-time password to your email address.
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;