import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Clock, TrendingUp, ExternalLink, FileText } from 'lucide-react';
import { useTheme } from './App';
import Navbar from './Navbar';

interface DashboardProps {
  user: any;
  canvasToken: string | null;
  sessionId?: string;
  onLogout?: () => void;
  onReconnectCanvas?: () => void;
}

interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
}

interface Assignment {
  id: number;
  name: string;
  due_at: string | null;
  points_possible: number;
  course_id: number;
  has_submitted_submissions?: boolean;
  submission_types?: string[];
}

export default function Dashboard({ user, canvasToken, onLogout }: DashboardProps) {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);

  const colors = {
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      border: '#e5e7eb',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#6d28d9',
    },
    dark: {
      bg: '#0a0a0a',
      cardBg: '#1a1a1a',
      border: '#2d2d2d',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#8b5cf6',
    },
  };
  const c = colors[theme];

  useEffect(() => {
    if (canvasToken) {
      fetchDashboardData();
    }
  }, [canvasToken]);

  const fetchDashboardData = async () => {
    if (!canvasToken) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch courses
      const coursesRes = await fetch(
        'http://localhost:3001/canvas-api/courses?enrollment_state=active&per_page=100',
        {
          headers: { Authorization: `Bearer ${canvasToken}` },
        }
      );

      if (!coursesRes.ok) throw new Error('Failed to fetch courses');
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Fetch assignments for all courses in parallel
      const assignmentPromises = coursesData.map((course: Course) =>
        fetch(
          `http://localhost:3001/canvas-api/courses/${course.id}/assignments?per_page=100&order_by=due_at`,
          {
            headers: { Authorization: `Bearer ${canvasToken}` },
          }
        )
          .then((res) => res.json())
          .then((assignments) =>
            assignments.map((a: Assignment) => ({ ...a, course_id: course.id }))
          )
          .catch(() => [])
      );

      const assignmentsArrays = await Promise.all(assignmentPromises);
      const flatAssignments = assignmentsArrays.flat();
      setAllAssignments(flatAssignments);

      setLoading(false);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Compute stats
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingAssignments = allAssignments
    .filter((a) => {
      if (!a.due_at) return false;
      const dueDate = new Date(a.due_at);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    })
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime());

  const missingAssignments = allAssignments.filter((a) => {
    if (!a.due_at) return false;
    const dueDate = new Date(a.due_at);
    return dueDate < now && !a.has_submitted_submissions;
  });

  const getCourseName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.course_code : 'Unknown';
  };

  const getCourseAssignments = (courseId: number) => {
    return allAssignments.filter((a) => a.course_id === courseId);
  };

  const getCourseUpcoming = (courseId: number) => {
    return allAssignments.filter((a) => {
      if (a.course_id !== courseId || !a.due_at) return false;
      const dueDate = new Date(a.due_at);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });
  };

  const getCourseQuizzes = (courseId: number) => {
    return allAssignments.filter(
      (a) =>
        a.course_id === courseId &&
        a.submission_types?.includes('online_quiz')
    );
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 24) return 'Due today';
    if (days < 2) return 'Due tomorrow';
    if (days < 7) return `Due in ${Math.ceil(days)} days`;
    return date.toLocaleDateString();
  };

  const formatOverdueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 1) return 'Due today';
    if (days < 2) return '1 day ago';
    return `${Math.ceil(days)} days ago`;
  };

  const getDueBadgeColor = (dueAt: string) => {
    const date = new Date(dueAt);
    const diff = date.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24)
      return theme === 'light'
        ? { bg: '#fee2e2', text: '#b91c1c' }
        : { bg: '#7f1d1d', text: '#fca5a5' };
    if (hours < 72)
      return theme === 'light'
        ? { bg: '#fef3c7', text: '#92400e' }
        : { bg: '#3d2c00', text: '#fcd34d' };
    return theme === 'light'
      ? { bg: '#dbeafe', text: '#1e40af' }
      : { bg: '#1e3a5f', text: '#93c5fd' };
  };

  if (loading) {
    return (
      <div
        style={{
          background: c.bg,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Navbar onLogout={onLogout} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: c.text,
          }}
        >
          Loading your dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: c.bg,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Navbar onLogout={onLogout} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: c.text,
            gap: '16px',
          }}
        >
          <AlertCircle size={48} color={c.accent} />
          <p>Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: '10px 20px',
              background: c.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: c.bg,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Navbar onLogout={onLogout} />

      <div
        style={{
          flex: 1,
          padding: '40px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <header>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: c.text,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            Good afternoon, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p style={{ color: c.textSecondary, fontSize: '14px', margin: 0 }}>
            Here's your personalized course overview
          </p>
        </header>

        {/* Overview Cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {[
            {
              icon: <BookOpen size={20} />,
              title: 'Active Courses',
              value: courses.length.toString(),
              sub: 'Currently enrolled',
            },
            {
              icon: <Clock size={20} />,
              title: 'Upcoming',
              value: upcomingAssignments.length.toString(),
              sub: 'Next 7 days',
            },
            {
              icon: <AlertCircle size={20} />,
              title: 'Missing',
              value: missingAssignments.length.toString(),
              sub: 'Past due',
            },
            {
              icon: <TrendingUp size={20} />,
              title: 'Total Assignments',
              value: allAssignments.length.toString(),
              sub: 'Across all courses',
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div
                  style={{
                    color: c.accent,
                    background: theme === 'light' ? '#f5f3ff' : '#2d1b69',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {card.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', color: c.textSecondary, margin: 0 }}>
                    {card.title}
                  </p>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: c.text, margin: 0 }}>
                    {card.value}
                  </h2>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0 }}>
                {card.sub}
              </p>
            </div>
          ))}
        </section>

        {/* Active Courses */}
        <section>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: c.text,
              margin: 0,
              marginBottom: '16px',
            }}
          >
            Active Courses
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courses.length === 0 ? (
              <p style={{ color: c.textSecondary, margin: 0 }}>No active courses found</p>
            ) : (
              courses.map((course) => {
                const courseAssignments = getCourseAssignments(course.id);
                const courseUpcoming = getCourseUpcoming(course.id);
                const courseQuizzes = getCourseQuizzes(course.id);

                return (
                  <div
                    key={course.id}
                    style={{
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '10px',
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: c.text, fontSize: '16px', fontWeight: 600, margin: 0, marginBottom: '4px' }}>
                          {course.name}
                        </h3>
                        <p style={{ color: c.textSecondary, fontSize: '13px', margin: 0 }}>
                          {course.course_code}
                        </p>
                      </div>
                      <a
                        href={`https://canvas.instructure.com/courses/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          background: c.accent,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                      >
                        Open in Canvas
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    {/* Course Stats */}
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} color={c.textSecondary} />
                        <span style={{ fontSize: '13px', color: c.textSecondary }}>
                          {courseAssignments.length} assignment{courseAssignments.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {courseUpcoming.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Clock size={16} color={c.accent} />
                          <span style={{ fontSize: '13px', color: c.accent, fontWeight: 500 }}>
                            {courseUpcoming.length} upcoming
                          </span>
                        </div>
                      )}

                      {courseQuizzes.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertCircle size={16} color={c.textSecondary} />
                          <span style={{ fontSize: '13px', color: c.textSecondary }}>
                            {courseQuizzes.length} quiz{courseQuizzes.length !== 1 ? 'zes' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Upcoming Assignments */}
        <section>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: c.text,
              margin: 0,
              marginBottom: '16px',
            }}
          >
            Upcoming Assignments (Next 7 Days)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingAssignments.length === 0 ? (
              <p style={{ color: c.textSecondary, margin: 0 }}>
                No upcoming assignments in the next 7 days 🎉
              </p>
            ) : (
              upcomingAssignments.map((assignment) => {
                const badgeColor = getDueBadgeColor(assignment.due_at!);
                return (
                  <div
                    key={assignment.id}
                    style={{
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '10px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{ color: c.text, fontSize: '15px', fontWeight: 600, margin: 0, marginBottom: '4px' }}
                      >
                        {assignment.name}
                      </h3>
                      <p style={{ color: c.textSecondary, fontSize: '13px', margin: 0 }}>
                        {getCourseName(assignment.course_id)} • {assignment.points_possible} points
                      </p>
                    </div>
                    <span
                      style={{
                        background: badgeColor.bg,
                        color: badgeColor.text,
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDueDate(assignment.due_at!)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Missing Assignments */}
        {missingAssignments.length > 0 && (
          <section>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: c.text,
                margin: 0,
                marginBottom: '16px',
              }}
            >
              Missing Assignments ⚠️
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {missingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  style={{
                    background: c.cardBg,
                    border: `2px solid ${theme === 'light' ? '#fca5a5' : '#7f1d1d'}`,
                    borderRadius: '10px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{ color: c.text, fontSize: '15px', fontWeight: 600, margin: 0, marginBottom: '4px' }}
                    >
                      {assignment.name}
                    </h3>
                    <p style={{ color: c.textSecondary, fontSize: '13px', margin: 0 }}>
                      {getCourseName(assignment.course_id)} • {assignment.points_possible} points
                    </p>
                  </div>
                  <span
                    style={{
                      background: theme === 'light' ? '#fee2e2' : '#7f1d1d',
                      color: theme === 'light' ? '#b91c1c' : '#fca5a5',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatOverdueDate(assignment.due_at!)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
