import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onVerificationComplete: (sessionId: string, user: any) => void;
  onBackToAuth: () => void;
}

export default function EmailVerification({ email, onVerificationComplete, onBackToAuth }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerificationComplete(data.sessionId, data.user);
        }, 1000);
      } else {
        setError(data.error || 'Invalid verification code');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      // In demo mode, accept any 6-digit code
      if (verificationCode.length === 6) {
        setSuccess('Email verified successfully!');
        const demoUser = {
          userId: 'demo-verified-' + Date.now(),
          email: email,
          name: email.split('@')[0],
          emailVerified: true,
        };
        const demoSessionId = 'demo-session-' + Date.now();
        
        setTimeout(() => {
          onVerificationComplete(demoSessionId, demoUser);
        }, 1000);
      } else {
        setError('Please enter a valid 6-digit code (demo mode: any 6 digits work)');
      }
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('http://localhost:3001/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Verification email sent! Check your inbox.');
        setResendCooldown(60); // 60 second cooldown
      } else {
        setError(data.error || 'Failed to resend email');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      setSuccess('Verification email sent! (Demo mode - use any 6-digit code)');
      setResendCooldown(60);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl text-gray-900">SnapSyllabus</h1>
          </div>
          <p className="text-gray-600">
            AI-powered study assistant for Canvas
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-center">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a verification code to<br />
              <span className="text-gray-900">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center tracking-widest text-xl"
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your email for the verification code
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Didn't receive the email?</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={loading || resendCooldown > 0}
                className="w-full"
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Verification Email'}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={onBackToAuth}
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-900 text-center">
            <strong>Demo Mode:</strong> Enter any 6-digit code to verify your email
          </p>
        </div>
      </div>
    </div>
  );
}
