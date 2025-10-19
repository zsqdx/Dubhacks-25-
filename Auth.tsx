import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, AlertCircle, CheckCircle2, Mail } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (sessionId: string, user: any) => void;
  onNeedVerification?: (email: string) => void;
}

export default function Auth({ onAuthSuccess, onNeedVerification }: AuthProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationMessage(null);

    try {
      const response = await fetch('http://localhost:3001/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setVerificationMessage('Verification email sent! Check your inbox.');
      } else {
        setError(data.error || 'Failed to send verification email');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      setVerificationMessage('Verification email sent! (Demo mode - check your console)');
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError(null);
    setVerificationMessage(null);

    try {
      const response = await fetch('http://localhost:3001/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.canvasToken) {
          localStorage.setItem('canvasToken', data.canvasToken);
        }
        onAuthSuccess(data.sessionId, data.user);
      } else {
        setError(data.error || 'Google login failed');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      const demoUser = {
        userId: 'demo-google-' + Date.now(),
        email: 'demo@example.com',
        name: 'Demo User',
      };
      const demoSessionId = 'demo-session-' + Date.now();
      
      setTimeout(() => {
        onAuthSuccess(demoSessionId, demoUser);
      }, 500);
      setLoading(false);
    }
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setVerificationMessage(null);

    const endpoint = isSignup ? '/auth/signup' : '/auth/login';
    const body = isSignup ? { email, password, name } : { email, password };

    try {
      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Check if email verification is required
        if (data.requiresVerification) {
          setLoading(false);
          if (onNeedVerification) {
            onNeedVerification(email);
          }
          return;
        }
        
        if (data.canvasToken) {
          localStorage.setItem('canvasToken', data.canvasToken);
        }
        onAuthSuccess(data.sessionId, data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      if (isSignup) {
        // For signups in demo mode, require email verification
        setLoading(false);
        if (onNeedVerification) {
          onNeedVerification(email);
        }
      } else {
        // For logins in demo mode, skip verification
        const demoUser = {
          userId: 'demo-' + Date.now(),
          email: email,
          name: email.split('@')[0],
        };
        const demoSessionId = 'demo-session-' + Date.now();
        
        setTimeout(() => {
          onAuthSuccess(demoSessionId, demoUser);
        }, 500);
        setLoading(false);
      }
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
            <CardTitle className="text-2xl text-center">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignup 
                ? 'Sign up to start using your AI tutor' 
                : 'Sign in to continue your learning'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign in failed')}
                size="large"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsAuth} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isSignup && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    Resend verification email
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {verificationMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="ml-2 text-green-800">
                  {verificationMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center text-sm">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setIsSignup(false)}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setIsSignup(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
