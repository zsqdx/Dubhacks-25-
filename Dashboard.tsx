import React from 'react';
import Navigation from './Navigation';
import CanvasLogin from './CanvasLogin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: any;
  canvasToken: string | null;
  sessionId: string;
  onLogout: () => void;
  onReconnectCanvas: () => void;
}

export default function Dashboard({ user, canvasToken, sessionId, onLogout, onReconnectCanvas }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navigation user={user} onLogout={onLogout} />

      {canvasToken !== 'skipped' ? (
        <CanvasLogin initialToken={canvasToken} userId={user.userId} sessionId={sessionId} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-2xl mx-auto text-center shadow-lg border-0">
            <CardHeader className="pb-4">
              <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Canvas Not Connected</CardTitle>
              <CardDescription className="text-base">
                To access your courses and get personalized AI tutoring, you'll need to connect your Canvas account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div className="bg-blue-50 rounded-lg p-6 text-left">
                <h3 className="text-sm text-blue-900 mb-3">
                  What you'll get with Canvas:
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Access all your Canvas courses in one place</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Get AI help tailored to your course materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Study smarter with personalized assistance</span>
                  </li>
                </ul>
              </div>
              
              <Button
                onClick={onReconnectCanvas}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Connect Canvas Now
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
