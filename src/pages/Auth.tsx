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
      setError(error || 'Failed to send OTP');
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
      setError(error || 'Invalid OTP');
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
      bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
      relative overflow-hidden
      p-4 sm:p-6
    `}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <Card className={`
        w-full shadow-2xl border-0
        bg-white/80 backdrop-blur-sm
        ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-md' : 'max-w-md'}
        relative z-10
      `}>
        <CardHeader className={`
          text-center space-y-4
          ${isMobile ? 'p-6' : 'p-8'}
        `}>
          <div className={`
            mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 
            rounded-full flex items-center justify-center shadow-lg
            ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}
            p-3
          `}>
            <RocketIcon 
              size={isMobile ? 32 : 40}
              className="text-white drop-shadow-sm"
            />
          </div>
          <CardTitle className={`
            font-bold text-gray-900
            ${isMobile ? 'text-2xl' : 'text-3xl'}
            bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent
          `}>
            {otpSent ? 'Enter OTP' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className={`
            text-gray-600
            ${isMobile ? 'text-base' : 'text-lg'}
            max-w-sm mx-auto
          `}>
            {otpSent 
              ? 'We\'ve sent a one-time code to your email'
              : 'Sign in to your account using your email'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className={`
          ${isMobile ? 'px-6 pb-6' : 'px-8 pb-8'}
        `}>
          {otpSent ? (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50/50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="otp" className={`
                  ${isMobile ? 'text-sm' : 'text-base'}
                  font-medium text-gray-700
                `}>
                  One-Time Code
                </Label>
                <div className="relative">
                  <Lock className={`
                    absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400
                    ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}
                  `} />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`
                      pl-12 pr-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500
                      ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'}
                      touch-manipulation rounded-xl
                      bg-white/70 backdrop-blur-sm
                    `}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`
                  w-full shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'}
                  active:scale-95 transition-all duration-200
                  touch-manipulation font-semibold
                `}
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
                    text-gray-500 hover:text-gray-700 hover:bg-gray-100
                    ${isMobile ? 'text-sm h-11' : 'text-base h-12'}
                    active:scale-95 transition-all duration-200 rounded-xl
                  `}
                >
                  <ArrowLeft className={`
                    mr-2
                    ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}
                  `} />
                  Back to email
                </Button>
              </div>

              <div className={`
                text-center text-muted-foreground
                ${isMobile ? 'text-sm' : 'text-base'}
                bg-gray-50/50 rounded-lg p-4
              `}>
                <p>
                  Didn't receive the code? Check your spam folder or try again.
                </p>
              </div>
            </form>
          ) : (
            // Email Input Form
            <form onSubmit={handleSendOtp} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50/50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className={`
                  ${isMobile ? 'text-sm' : 'text-base'}
                  font-medium text-gray-700
                `}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`
                    absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400
                    ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}
                  `} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`
                      pl-12 pr-4 border-gray-200 focus:border-blue-500 focus:ring-blue-500
                      ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'}
                      touch-manipulation rounded-xl
                      bg-white/70 backdrop-blur-sm
                    `}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`
                  w-full shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'}
                  active:scale-95 transition-all duration-200
                  touch-manipulation font-semibold
                `}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>

              <div className={`
                text-center text-muted-foreground
                ${isMobile ? 'text-sm' : 'text-base'}
                bg-gray-50/50 rounded-lg p-4
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