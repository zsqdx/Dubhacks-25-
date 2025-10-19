import React, { useState, useEffect } from 'react';
import { createCanvasClient, CanvasCourse, CanvasAssignment } from './canvasApi';

interface CanvasLoginProps {
  initialToken?: string;
  userId?: string;
  sessionId?: string;
}

export default function CanvasLogin({ initialToken, userId, sessionId }: CanvasLoginProps) {
  const [token, setToken] = useState(initialToken || '');
  const [courses, setCourses] = useState<CanvasCourse[]>([]);
  const [assignments, setAssignments] = useState<Map<number, CanvasAssignment[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Auto-load if token provided
  useEffect(() => {
    if (initialToken) {
      handleLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleLogin = async () => {
    if (!token.trim()) {
      setError('Please enter a Canvas access token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = createCanvasClient(token);

      // Fetch courses directly (validates token implicitly)
      const fetchedCourses = await client.getCourses();

      if (fetchedCourses.length === 0) {
        setError('No courses found. Please create a course in Canvas first.');
      }

      setCourses(fetchedCourses);

      // Fetch assignments for all courses
      const fetchedAssignments = await client.getAllAssignments();
      setAssignments(fetchedAssignments);

      setIsAuthenticated(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch courses. Check your token and make sure you have courses created.'
      );
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Your Canvas Courses</h2>

      {loading && <p style={{ color: '#666' }}>Loading courses...</p>}

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '20px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      {!loading && (
        <div>
          {courses.length === 0 ? (
            <p style={{ color: '#666' }}>No active courses found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {courses.map((course) => {
                const courseAssignments = assignments.get(course.id) || [];
                return (
                  <div
                    key={course.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>{course.name}</h3>
                    <p style={{ margin: '4px 0 12px 0', color: '#666', fontSize: '14px' }}>
                      <strong>Course Code:</strong> {course.course_code}
                    </p>

                    {courseAssignments.length === 0 ? (
                      <p style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                        No assignments found
                      </p>
                    ) : (
                      <div>
                        <h4
                          style={{
                            margin: '12px 0 8px 0',
                            color: '#555',
                            fontSize: '16px',
                          }}
                        >
                          Assignments ({courseAssignments.length})
                        </h4>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {courseAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              style={{
                                padding: '10px',
                                backgroundColor: '#fff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'start',
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <p
                                    style={{
                                      margin: '0 0 4px 0',
                                      fontWeight: 500,
                                      color: '#333',
                                    }}
                                  >
                                    {assignment.name}
                                  </p>
                                  <p
                                    style={{
                                      margin: '0',
                                      fontSize: '13px',
                                      color: '#666',
                                    }}
                                  >
                                    Due: {formatDate(assignment.due_at)}
                                  </p>
                                </div>
                                <div style={{ textAlign: 'right', marginLeft: '10px' }}>
                                  <p
                                    style={{
                                      margin: '0',
                                      fontSize: '13px',
                                      color: '#666',
                                    }}
                                  >
                                    {assignment.points_possible} pts
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
