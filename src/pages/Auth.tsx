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

const Auth = () => {
  const { signInWithOtp, verifyOtp, user } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {otpSent ? 'Enter OTP' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {otpSent 
              ? 'We\'ve sent a one-time code to your email'
              : 'Sign in to your account using your email'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {otpSent ? (
            // OTP Verification Form
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Code</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-soft rounded-lg px-4 py-2"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToEmail}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to email
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
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
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-soft rounded-lg px-4 py-2"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  We'll send a one-time code to your email address for secure login.
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