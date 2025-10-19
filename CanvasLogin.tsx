import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Alert, AlertDescription } from './ui/alert';
import { BookOpen, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  course_code: string;
  enrollment_term_id?: number;
  workflow_state?: string;
}

interface CanvasLoginProps {
  initialToken: string | null;
  userId: string;
  sessionId: string;
}

export default function CanvasLogin({ initialToken, userId, sessionId }: CanvasLoginProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/canvas/courses', {
        headers: {
          'Authorization': `Bearer ${sessionId}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setError(data.error || 'Failed to fetch courses');
      }
    } catch (err) {
      // Backend not available - use demo courses
      const demoCourses: Course[] = [
        {
          id: '1',
          name: 'Introduction to Computer Science',
          course_code: 'CS 101',
          workflow_state: 'available',
        },
        {
          id: '2',
          name: 'Data Structures and Algorithms',
          course_code: 'CS 201',
          workflow_state: 'available',
        },
        {
          id: '3',
          name: 'Web Development Fundamentals',
          course_code: 'CS 230',
          workflow_state: 'available',
        },
        {
          id: '4',
          name: 'Calculus II',
          course_code: 'MATH 152',
          workflow_state: 'available',
        },
        {
          id: '5',
          name: 'Physics for Engineers',
          course_code: 'PHYS 201',
          workflow_state: 'available',
        },
        {
          id: '6',
          name: 'Database Systems',
          course_code: 'CS 340',
          workflow_state: 'available',
        },
      ];
      
      setTimeout(() => {
        setCourses(demoCourses);
      }, 800);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken && initialToken !== 'skipped') {
      fetchCourses();
    } else {
      setLoading(false);
    }
  }, [initialToken, sessionId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {error}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={fetchCourses} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-sm text-gray-500 mb-6">
              We couldn't find any courses in your Canvas account.
            </p>
            <Button onClick={fetchCourses} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Your Canvas Courses</h1>
        <p className="text-gray-600">
          {courses.length} {courses.length === 1 ? 'course' : 'courses'} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card 
            key={course.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => navigate(`/course/${course.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                {course.workflow_state === 'available' && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {course.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.course_code}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full">
                View Course Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
