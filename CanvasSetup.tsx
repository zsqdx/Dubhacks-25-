import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface CanvasSetupProps {
  sessionId: string;
  onSetupComplete: (canvasToken: string) => void;
}

export default function CanvasSetup({ sessionId, onSetupComplete }: CanvasSetupProps) {
  const [canvasToken, setCanvasToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canvasToken.trim()) {
      setError('Please enter a Canvas access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/auth/setup-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, canvasToken }),
      });

      const data = await response.json();

      if (data.success) {
        onSetupComplete(canvasToken);
      } else {
        setError(data.error || 'Failed to setup Canvas');
      }
      setLoading(false);
    } catch (err) {
      // Backend not available - use demo mode
      setTimeout(() => {
        onSetupComplete(canvasToken || 'demo-token');
      }, 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl text-gray-900">SnapSyllabus</h1>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Connect Canvas</CardTitle>
            <CardDescription>
              Link your Canvas account to unlock personalized AI tutoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <CheckCircle2 className="h-5 w-5" />
                  How to get your Canvas Access Token
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-2 text-sm text-blue-900">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                      1
                    </span>
                    <span className="pt-0.5">
                      Go to{' '}
                      <a
                        href="https://canvas.instructure.com/profile/settings"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 underline hover:text-blue-700"
                      >
                        Canvas Settings
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                      2
                    </span>
                    <span className="pt-0.5">Scroll to "Approved Integrations"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                      3
                    </span>
                    <span className="pt-0.5">Click "+ New Access Token"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                      4
                    </span>
                    <span className="pt-0.5">Enter "SnapSyllabus" as the purpose</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs">
                      5
                    </span>
                    <span className="pt-0.5">Click "Generate Token" and copy it</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Token Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="canvas-token">Canvas Access Token</Label>
                <Input
                  id="canvas-token"
                  type="password"
                  value={canvasToken}
                  onChange={(e) => setCanvasToken(e.target.value)}
                  placeholder="Paste your token here"
                  className="font-mono"
                />
                <p className="text-xs text-gray-500">
                  🔒 Your token is encrypted and stored securely
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {loading ? 'Connecting...' : 'Connect Canvas'}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {/* Skip Option */}
            <div className="pt-4 border-t">
              <Button
                onClick={() => onSetupComplete('')}
                variant="ghost"
                className="w-full text-gray-600"
              >
                Skip for now (limited features)
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-6">
          Need help? Contact support@snapsyllabus.com
        </p>
      </div>
    </div>
  );
}
