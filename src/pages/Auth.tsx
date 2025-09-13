import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { RocketIcon } from '@/components/ui/RocketIcon';
import { useIsMobile } from '@/hooks/use-mobile';
import { secureLog } from '@/config/security';
import { OTPInput } from '@/components/ui/OTPInput';

const Auth = () => {
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useIsMobile();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!signInWithOtp) {
      setError('Authentication service not available');
      toast.error('Authentication service not available');
      return;
    }

    setLoading(true);
    setError('');
    secureLog('info', 'Initiating OTP send', { email });

    const { error } = await signInWithOtp(email);

    if (error) {
      secureLog('error', 'OTP Error', { error });
      setError(error || 'Failed to send OTP');
      toast.error('Failed to send OTP');
    } else {
      setOtpSent(true);
      startResendTimer();
      toast.success('OTP sent to your email');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    if (!verifyOtp) {
      setError('Authentication service not available');
      toast.error('Authentication service not available');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      // Add timeout to the verification call
      const verificationPromise = verifyOtp(email, otp);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Verification timeout')), 12000)
      );
      
      const { error } = await Promise.race([verificationPromise, timeoutPromise]) as any;

      if (error) {
        if (error.includes('timeout') || error.includes('timeout')) {
          setError('Verification is taking too long. Please try again.');
        } else if (error.includes('Invalid') || error.includes('invalid')) {
          setError('Incorrect code. Please check and try again.');
        } else {
          setError('Verification failed. Please try again.');
        }
        setVerifying(false);
        toast.error('OTP verification failed');
      } else {
        toast.success('Login successful');
        // Don't navigate here - let the useEffect handle it
        // The user state change will trigger navigation
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      if (err instanceof Error && err.message.includes('timeout')) {
        setError('Verification timeout. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
      }, 15000); // Reduced to 15 seconds for faster response

      return () => clearTimeout(timeoutId);
    }
  }, [verifying]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setOtp('');
    const { error } = await signInWithOtp(email);
    
    if (error) {
      setError('Failed to resend OTP');
    } else {
      startResendTimer();
      toast.success('OTP resent to your email');
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
            {otpSent ? 'We\'ve sent a one-time code to your email' : 'Sign in to your account using your email'}
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
                  <ArrowLeft className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
                  Back to email
                </Button>
              </div>

              <div className={`text-center ${isMobile ? 'text-sm' : 'text-base'} text-white/60 bg-white/5 rounded-lg p-4`}>
                <p>Didn't receive the code? Check your spam folder or try again.</p>
              </div>
            </form>
          ) : (
            // Email Input Form
            <form onSubmit={handleSendOtp} className="space-y-6">
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

              <div className={`text-center ${isMobile ? 'text-sm' : 'text-base'} text-white/60 bg-white/5 rounded-lg p-4`}>
                <p>We'll send a one-time password to your email address.</p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;