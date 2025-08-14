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
import { secureLog } from '@/config/security';

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
    secureLog('info', 'Initiating OTP send', { email });

    const { error } = await signInWithOtp(email);

    if (error) {
      secureLog('error', 'OTP Error', { error });
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
      header-black-green
      relative overflow-hidden
      p-4 sm:p-6
    `}>
      {/* Subtle green glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl" style={{background:'radial-gradient(closest-side, rgba(48,228,129,0.12), rgba(0,0,0,0))'}}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl" style={{background:'radial-gradient(closest-side, rgba(28,178,85,0.10), rgba(0,0,0,0))'}}></div>
      </div>

      <Card className={`
        w-full shadow-2xl border border-white/10
        bg-white/5 backdrop-blur-xl text-white
        ${isMobile ? 'max-w-sm' : isTablet ? 'max-w-md' : 'max-w-md'}
        relative z-10
      `}>
        <CardHeader className={`${isMobile ? 'p-6' : 'p-8'} text-center space-y-4`}>
          <div className={`
            mx-auto bg-white/10 rounded-full flex items-center justify-center shadow-lg
            ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}
          `}>
            <RocketIcon size={isMobile ? 32 : 40} className="text-white" />
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

              <div className="space-y-3">
                <Label htmlFor="otp" className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-white/80`}>
                  One-Time Code
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/50 ${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`
                      pl-12 pr-4 ${isMobile ? 'h-12 text-lg' : 'h-14 text-lg'} rounded-xl
                      bg-white/10 text-white placeholder-white/50 border-white/20 focus:ring-[#30E481] focus:border-[#30E481]
                    `}
                    maxLength={6}
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
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

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