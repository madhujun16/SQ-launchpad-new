import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, XCircle } from 'lucide-react';
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import { secureLog } from '@/config/security';
import { OTPInput } from '@/components/ui/OTPInput';
import { AuthService } from '@/services/authService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useIsMobile();
  
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [lastOtpRequest, setLastOtpRequest] = useState<number>(0);

  useEffect(() => {
    if (user) {
      // Check if there's a stored redirect path from before authentication
      const redirectPath = sessionStorage.getItem('redirectAfterAuth');
      if (redirectPath && redirectPath !== '/auth') {
        console.log('🔄 Redirecting back to original route:', redirectPath);
        sessionStorage.removeItem('redirectAfterAuth');
        navigate(redirectPath, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Resend timer effect
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpSent, resendTimer]);

  const startResendTimer = () => {
    setResendTimer(60); // 60 seconds
  };

  // Handle password-based login with backend API
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');
    secureLog('info', 'Initiating password login', { email });

    try {
      const response = await AuthService.loginWithPassword(email, password);

      if (!response.success || response.error) {
        secureLog('error', 'Password login error', { error: response.error });
        setError(response.error?.message || 'Login failed');
        toast.error(response.error?.message || 'Login failed');
      } else {
        toast.success('Login successful');
        secureLog('info', 'Password login successful');
        
        // Force reload to update auth context
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Password login error:', err);
      setError('An unexpected error occurred');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Check rate limiting - prevent requests within 30 seconds
    const now = Date.now();
    const timeSinceLastRequest = now - lastOtpRequest;
    const minInterval = 30000; // 30 seconds

    if (timeSinceLastRequest < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastRequest) / 1000);
      setError(`Please wait ${remainingTime} seconds before requesting another OTP`);
      toast.error(`Rate limited - wait ${remainingTime}s`);
      return;
    }

    setLoading(true);
    setError('');
    secureLog('info', 'Initiating OTP request', { email });

    try {
      const response = await AuthService.requestOTP(email);

      if (!response.success || response.error) {
        secureLog('error', 'OTP request error', { error: response.error });
        
        if (response.error?.message?.includes('429') || response.error?.message?.includes('Too Many Requests')) {
          setError('Too many requests. Please wait 2 minutes before trying again.');
          toast.error('Rate limited - please wait 2 minutes');
          setLastOtpRequest(now);
          setResendTimer(120); // 2 minutes
        } else {
          setError(response.error?.message || 'Failed to send OTP');
          toast.error('Failed to send OTP');
        }
      } else {
        setOtpSent(true);
        setLastOtpRequest(now);
        startResendTimer();
        toast.success('OTP sent to your email');
      }
    } catch (err) {
      console.error('OTP send error:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to send OTP');
    }
    
    setLoading(false);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await AuthService.loginWithOTP(email, otp);

      if (!response.success || response.error) {
        if (response.error?.message?.includes('429') || response.error?.message?.includes('Too Many Requests')) {
          setError('Too many verification attempts. Please wait 2 minutes.');
          toast.error('Rate limited - wait 2 minutes');
        } else if (response.error?.message?.includes('Invalid') || response.error?.message?.includes('invalid')) {
          setError('Incorrect code. Please check and try again.');
        } else {
          setError('Verification failed. Please try again.');
        }
        setVerifying(false);
        toast.error('OTP verification failed');
      } else {
        toast.success('Login successful');
        // Force reload to update auth context
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('An unexpected error occurred. Please try again.');
      setVerifying(false);
      toast.error('Verification failed - please try again');
    }
  };

  // Reset verifying state if user changes
  useEffect(() => {
    if (user) {
      setVerifying(false);
      setOtp('');
      setError('');
    }
  }, [user]);

  // Add timeout for verification to prevent getting stuck
  useEffect(() => {
    if (verifying) {
      const timeoutId = setTimeout(() => {
        setVerifying(false);
        setError('Verification is taking longer than expected. Please try again.');
        toast.error('Verification timeout - please try again');
      }, 12000); // 12 seconds timeout

      return () => clearTimeout(timeoutId);
    }
  }, [verifying]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    // Check rate limiting for resend
    const now = Date.now();
    const timeSinceLastRequest = now - lastOtpRequest;
    const minInterval = 30000; // 30 seconds

    if (timeSinceLastRequest < minInterval) {
      const remainingTime = Math.ceil((minInterval - timeSinceLastRequest) / 1000);
      setError(`Please wait ${remainingTime} seconds before requesting another OTP`);
      toast.error(`Rate limited - wait ${remainingTime}s`);
      return;
    }
    
    setError('');
    setOtp('');
    
    try {
      const response = await AuthService.requestOTP(email);
      
      if (!response.success || response.error) {
        if (response.error?.message?.includes('429') || response.error?.message?.includes('Too Many Requests')) {
          setError('Too many requests. Please wait 2 minutes before trying again.');
          toast.error('Rate limited - please wait 2 minutes');
          setLastOtpRequest(now);
          setResendTimer(120); // 2 minutes
        } else {
          setError('Failed to resend OTP');
          toast.error('Failed to resend OTP');
        }
      } else {
        setLastOtpRequest(now);
        startResendTimer();
        toast.success('OTP resent to your email');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend OTP');
      toast.error('Failed to resend OTP');
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp('');
    setError('');
    setResendTimer(0);
    setVerifying(false);
  };

  return (
    <div className="auth-page-background flex items-center justify-center p-4 sm:p-6">
      <Card className={`
        w-full border border-white/20
        bg-white/10 text-white
        ${isMobile ? 'max-w-sm' : 'max-w-md'}
      `}>
        <CardHeader className={`${isMobile ? 'p-6' : 'p-8'} text-center space-y-4`}>
          <div className="mx-auto bg-white/10 rounded-full flex items-center justify-center w-16 h-16">
            <RocketIcon size={32} className="text-white" />
          </div>
          <CardTitle className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`}> 
            {otpSent ? 'Enter OTP' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className={`${isMobile ? 'text-base' : 'text-lg'} max-w-sm mx-auto text-white/70`}>
            {otpSent 
              ? 'We\'ve sent a one-time code to your email' 
              : loginMethod === 'password' 
                ? 'Sign in to your account securely'
                : 'Sign in to your account using OTP'}
          </CardDescription>
        </CardHeader>

        <CardContent className={`${isMobile ? 'px-6 pb-6' : 'px-8 pb-8'}`}>
          {otpSent ? (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-400 bg-red-900/20 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <Label className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white/80 text-center block`}>
                  Enter 6-digit code
                </Label>
                <OTPInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  error={!!error}
                  disabled={verifying}
                />
                
                {otp.length === 6 && !verifying && (
                  <Button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    className="w-full bg-[#1CB255] hover:bg-[#17a04c] text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Continue
                  </Button>
                )}
              </div>

              {verifying && (
                <div className="text-center text-[#1CB255] text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#1CB255] border-t-transparent rounded-full animate-spin"></div>
                    Verifying your OTP...
                  </div>
                </div>
              )}

              {error && (
                <div className="text-center text-red-400 text-sm bg-red-900/20 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              <div className="text-center space-y-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0}
                  className={`text-[#1CB255] hover:text-[#17a04c] hover:bg-[#1CB255]/10 ${isMobile ? 'text-sm h-11' : 'text-base h-12'} rounded-xl`}
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                </Button>
              </div>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToEmail}
                  className={`text-white/70 hover:text-white hover:bg-white/10 ${isMobile ? 'text-sm h-11' : 'text-base h-12'} rounded-xl`}
                >
                  ← Back to login
                </Button>
              </div>

              <div className={`text-center ${isMobile ? 'text-sm' : 'text-base'} text-white/60 bg-white/5 rounded-lg p-4`}>
                <p>Didn't receive the code? Check your spam folder or try again.</p>
              </div>
            </form>
          ) : (
            // Login Form with Tabs
            <div className="space-y-6">
              <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'otp' | 'password')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/10">
                  <TabsTrigger value="password" className="data-[state=active]:bg-[#1CB255] data-[state=active]:text-white">
                    <Lock className="h-4 w-4 mr-2" />
                    Password
                  </TabsTrigger>
                  <TabsTrigger value="otp" className="data-[state=active]:bg-[#1CB255] data-[state=active]:text-white">
                    <Key className="h-4 w-4 mr-2" />
                    OTP
                  </TabsTrigger>
                </TabsList>

                {/* Password Login */}
                <TabsContent value="password">
                  <form onSubmit={handlePasswordLogin} className="space-y-6">
                    {error && (
                      <Alert variant="destructive" className="border-red-400 bg-red-900/20 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="email" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white/80`}>
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/50 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`
                            pl-12 pr-4 ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} rounded-xl
                            bg-white/10 text-white placeholder-white/50 border-white/20 focus:ring-[#30E481] focus:border-[#30E481]
                          `}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="password" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white/80`}>
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/50 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`
                            pl-12 pr-4 ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} rounded-xl
                            bg-white/10 text-white placeholder-white/50 border-white/20 focus:ring-[#30E481] focus:border-[#30E481]
                          `}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`
                        w-full shadow-lg rounded-xl bg-[#1CB255] hover:bg-[#17a04c]
                        ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} font-semibold active:scale-95 transition-all duration-200
                      `}
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>

                {/* OTP Login */}
                <TabsContent value="otp">
                  <form onSubmit={handleSendOtp} className="space-y-6">
                    {error && (
                      <Alert variant="destructive" className="border-red-400 bg-red-900/20 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="email-otp" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white/80`}>
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/50 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
                        <Input
                          id="email-otp"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`
                            pl-12 pr-4 ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} rounded-xl
                            bg-white/10 text-white placeholder-white/50 border-white/20 focus:ring-[#30E481] focus:border-[#30E481]
                          `}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className={`
                        w-full shadow-lg rounded-xl bg-[#1CB255] hover:bg-[#17a04c]
                        ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} font-semibold active:scale-95 transition-all duration-200
                      `}
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className={`text-center ${isMobile ? 'text-sm' : 'text-base'} text-white/60 bg-white/5 rounded-lg p-4`}>
                <p>{loginMethod === 'password' ? 'Use your email and password to sign in securely.' : 'We\'ll send a one-time password to your email address.'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
