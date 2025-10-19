import React from 'react';
import { BookOpen, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { useTheme } from './App';
import Navbar from './Navbar';

interface DashboardProps {
  user: any;
  canvasToken: string | null;
}

export default function Dashboard({ user, canvasToken }: DashboardProps) {
  const { theme } = useTheme();

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

  return (
    <div style={{ background: c.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ✅ Navbar added here */}
      <Navbar />

      {/* Page content */}
      <div
        style={{
          flex: 1,
          padding: '40px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
        }}
      >
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: c.text,
                marginBottom: '4px',
              }}
            >
              Good afternoon, {user?.name?.split(' ')[0] || 'Student'}
            </h1>
            <p style={{ color: c.textSecondary, fontSize: '14px' }}>
              Here’s your personalized course overview
            </p>
          </div>
        </header>

        {/* Overview Cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            { icon: <BookOpen size={20} />, title: 'Active Courses', value: '4', sub: 'Currently enrolled' },
            { icon: <TrendingUp size={20} />, title: 'Progress Score', value: '87%', sub: 'Overall completion' },
            { icon: <Clock size={20} />, title: 'Study Hours', value: '12.5', sub: 'This week' },
            { icon: <BarChart3 size={20} />, title: 'Concepts Reviewed', value: '23', sub: 'Across all modules' },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                padding: '20px',
                boxShadow:
                  theme === 'light'
                    ? '0 4px 12px rgba(0,0,0,0.05)'
                    : '0 4px 10px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    color: c.accent,
                    background: theme === 'light' ? '#f5f3ff' : '#2d1b69',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                >
                  {card.icon}
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: c.textSecondary }}>{card.title}</p>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: c.text }}>{card.value}</h2>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: c.textSecondary, marginTop: '12px' }}>{card.sub}</p>
            </div>
          ))}
        </section>

        {/* Insights Section */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: c.text, marginBottom: '16px' }}>
            Learning Insights
          </h2>
          <div
            style={{
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: '12px',
              padding: '24px',
              boxShadow:
                theme === 'light'
                  ? '0 4px 12px rgba(0,0,0,0.05)'
                  : '0 4px 10px rgba(0,0,0,0.4)',
            }}
          >
            <p style={{ fontSize: '15px', color: c.textSecondary, lineHeight: '1.6' }}>
              You’ve shown strong understanding in <b>Data Structures</b> and <b>Object-Oriented Programming</b>.
              Review is recommended for <b>Algorithm Complexity</b> — several quiz submissions suggest a minor gap in identifying runtime trade-offs.
              Consider revisiting the lecture slides or attempting short practice sets.
            </p>
          </div>
        </section>

        {/* Catch-Up Recommendations */}
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: c.text, marginBottom: '16px' }}>
            Catch-Up Recommendations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { course: 'INFO 370', topic: 'Linear Regression Foundations', due: '2 days ago' },
              { course: 'INFO 300', topic: 'User Research Methods Recap', due: 'Yesterday' },
              { course: 'CSE 123', topic: 'Recursion Practice Lab', due: 'Today' },
            ].map((task, i) => (
              <div
                key={i}
                style={{
                  background: c.cardBg,
                  border: `1px solid ${c.border}`,
                  borderRadius: '10px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ color: c.text, fontSize: '15px', fontWeight: 600 }}>{task.course}</h3>
                  <p style={{ color: c.textSecondary, fontSize: '14px' }}>{task.topic}</p>
                </div>
                <span
                  style={{
                    background: theme === 'light' ? '#fef3c7' : '#3d2c00',
                    color: theme === 'light' ? '#92400e' : '#fcd34d',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {task.due}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
