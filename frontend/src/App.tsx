import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

interface User {
  name: string;
  email: string;
  studentId: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'home' | 'chat'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('CS101');

  // LOGIN PAGE
  const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      
      // Mock login - replace with real authentication later
      if (email && password) {
        setUser({
          name: email.split('@')[0], // Use email username as name
          email: email,
          studentId: '12345'
        });
        setCurrentPage('home');
      }
    };

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#333' }}>
              AI Teaching Assistant
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Your 24/7 personalized learning companion
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontSize: '14px',
                fontWeight: '500',
                color: '#333'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              Sign In
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '13px', color: '#666' }}>
            Don't have an account? <span style={{ color: '#667eea', cursor: 'pointer' }}>Sign up</span>
          </div>
        </div>
      </div>
    );
  };

  // HOME PAGE
  const HomePage = () => {
    const courses = [
      { id: 'CS101', name: 'CS 101 - Intro to Programming', progress: 75, struggling: 'Recursion' },
      { id: 'CS201', name: 'CS 201 - Data Structures', progress: 60, struggling: 'Binary Trees' },
      { id: 'MATH101', name: 'MATH 101 - Calculus I', progress: 85, struggling: 'Integration' },
      { id: 'PHYS101', name: 'PHYS 101 - Physics I', progress: 50, struggling: 'Kinematics' }
    ];

    const startChat = (courseId: string) => {
      setSelectedCourse(courseId);
      setMessages([{
        id: '1',
        text: `Hi ${user?.name}! I'm ready to help you with ${courses.find(c => c.id === courseId)?.name}. I noticed you might be struggling with ${courses.find(c => c.id === courseId)?.struggling}. Would you like to work on that, or something else?`,
        isAI: true,
        timestamp: new Date()
      }]);
      setCurrentPage('chat');
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #e0e0e0',
          padding: '20px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: '0 0 5px 0', fontSize: '24px' }}>Welcome back, {user?.name}! 👋</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Ready to continue learning?</p>
            </div>
            <button
              onClick={() => {
                setUser(null);
                setCurrentPage('login');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Your Courses</h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {courses.map(course => (
              <div
                key={course.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onClick={() => startChat(course.id)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>{course.name}</h3>
                
                {/* Progress Bar */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Progress</span>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{course.progress}%</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: '#e0e0e0', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${course.progress}%`,
                      height: '100%',
                      background: course.progress >= 75 ? '#4CAF50' : course.progress >= 50 ? '#FFC107' : '#FF5722',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>

                {/* Struggling Topic */}
                <div style={{
                  background: '#fff3e0',
                  border: '1px solid #ffe0b2',
                  borderRadius: '6px',
                  padding: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '12px', color: '#f57c00', fontWeight: '600', marginBottom: '3px' }}>
                    Needs attention:
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {course.struggling}
                  </div>
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Start Learning →
                </button>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>Your Stats This Week</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>47</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Questions Asked</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>12</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Topics Mastered</div>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFC107' }}>8.5h</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Study Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // CHAT PAGE
  const ChatPage = () => {
    const handleSend = async () => {
      if (!input.trim() || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        text: input,
        isAI: false,
        timestamp: new Date()
      };
      setMessages([...messages, userMessage]);
      setInput('');
      setIsLoading(true);

      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Great question about "${input}"! I'm analyzing your course materials for ${selectedCourse}. (Mock response - connect backend for real AI!)`,
          isAI: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    };

    return (
      <div style={{ 
        maxWidth: '900px', 
        margin: '0 auto', 
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        {/* Header with Back Button */}
        <div style={{ 
          borderBottom: '2px solid #e0e0e0', 
          paddingBottom: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{ margin: '0 0 5px 0' }}>AI Teaching Assistant</h1>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                {selectedCourse}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '10px',
          height: '450px', 
          overflowY: 'auto',
          padding: '15px',
          marginBottom: '15px',
          background: '#fafafa'
        }}>
          {messages.map(msg => (
            <div 
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.isAI ? 'flex-start' : 'flex-end',
                marginBottom: '15px'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: msg.isAI ? '#e3f2fd' : '#c8e6c9',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                  {msg.text}
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  color: '#666', 
                  marginTop: '5px',
                  textAlign: msg.isAI ? 'left' : 'right'
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#e3f2fd',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            disabled={isLoading}
            style={{ 
              flex: 1, 
              padding: '12px 16px', 
              fontSize: '15px',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            style={{ 
              padding: '12px 24px', 
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '8px',
              border: 'none',
              background: isLoading || !input.trim() ? '#ccc' : '#4CAF50',
              color: 'white',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  };

  // Render current page
  if (currentPage === 'login') return <LoginPage />;
  if (currentPage === 'home') return <HomePage />;
  return <ChatPage />;
};

export default App;
