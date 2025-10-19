import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './App';
import { Lightbulb, BookOpen, MessageSquare, Send, Plus } from 'lucide-react';
import Navbar from './Navbar';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  type?: 'text' | 'code' | 'insight';
}

interface QuickPrompt {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const ChatPage: React.FC = () => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI tutor powered by AWS Bedrock. I can help you understand concepts, work through problems, and create personalized study plans based on your Canvas courses. What would you like to work on today?",
      isAI: true,
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const c = {
    dark: {
      bg: '#0a0a0a',
      sidebarBg: '#141414',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      accent: '#8b5cf6',
      cardBg: '#1a1a1a',
      border: '#2d2d2d',
      aiBg: '#1c1c1c',
      shadow: '0 4px 25px rgba(0,0,0,0.5)',
    },
    light: {
      bg: '#f9fafb',
      sidebarBg: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      accent: '#6d28d9',
      cardBg: '#ffffff',
      border: '#e5e7eb',
      aiBg: '#f3f4f6',
      shadow: '0 8px 25px rgba(0,0,0,0.1)',
    },
  }[theme];

  const quickPrompts: QuickPrompt[] = [
    { id: '1', label: 'Explain concept', icon: <Lightbulb size={15} />, prompt: 'Can you explain ' },
    { id: '2', label: 'Practice problem', icon: <BookOpen size={15} />, prompt: 'Give me a practice problem about ' },
    { id: '3', label: 'Study plan', icon: <MessageSquare size={15} />, prompt: 'Create a study plan for ' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // --- Keep existing AI send logic ---
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const sessionId = localStorage.getItem('sessionId') || undefined;
      const historyForServer = messages.slice(-10).map((m) => ({
        isAI: m.isAI,
        text: m.text,
      }));

      const base = (import.meta as any)?.env?.VITE_API_BASE || 'http://localhost:3001';
      const resp = await fetch(`${base}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          history: historyForServer,
          input,
          system: 'You are a helpful CS tutor. Be clear, concise, and friendly.',
        }),
      });

      const contentType = resp.headers.get('content-type') || '';
      const raw = await resp.text();
      if (!contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON (${resp.status}). First bytes: ${raw.slice(0, 200)}`);
      }

      const data = JSON.parse(raw);
      if (!resp.ok) throw new Error(data?.error || 'AI request failed');

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text || 'No text returned.',
        isAI: true,
        timestamp: new Date(),
        type: 'text',
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Error: ${e.message}`,
          isAI: true,
          timestamp: new Date(),
          type: 'text',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };
  // -------------------------------

  return (
    <div style={{ background: c.bg, color: c.text, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar pinned */}
        {showSidebar && (
          <aside
            style={{
              width: '260px',
              background: c.sidebarBg,
              borderRight: `1px solid ${c.border}`,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '13px',
                  color: c.textSecondary,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}
              >
                Quick Prompts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {quickPrompts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setInput(p.prompt)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px',
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      color: c.text,
                      fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = c.accent)}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = c.border)}
                  >
                    {p.icon}
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              style={{
                marginTop: '20px',
                padding: '10px',
                background: c.accent,
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
              onClick={() =>
                setMessages([
                  {
                    id: '1',
                    text: 'Starting a new session. What topic would you like to review today?',
                    isAI: true,
                    timestamp: new Date(),
                    type: 'text',
                  },
                ])
              }
            >
              <Plus size={15} /> New Chat
            </button>
          </aside>
        )}

        {/* Chat Area */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          {/* Greeting when empty */}
          {messages.length <= 1 && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '44px',
                  fontWeight: 600,
                  color: c.text,
                  marginBottom: '24px',
                }}
              >
                How are you today, Mazin?
              </h1>
            </div>
          )}

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '30px 20px',
              scrollBehavior: 'smooth',
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.isAI ? 'flex-start' : 'flex-end',
                    marginBottom: '18px',
                  }}
                >
                  <div
                    style={{
                      background: msg.isAI ? c.aiBg : c.accent,
                      color: msg.isAI ? c.text : 'white',
                      borderRadius: msg.isAI ? '6px 14px 14px 14px' : '14px 6px 14px 14px',
                      padding: '12px 16px',
                      maxWidth: '70%',
                      lineHeight: 1.5,
                      boxShadow: msg.isAI ? 'none' : '0 2px 10px rgba(139,92,246,0.25)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: c.textSecondary,
                    fontSize: '13px',
                  }}
                >
                  <span>AI Tutor is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Floating Input Bar */}
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: 'transparent',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                maxWidth: '720px',
                background: c.cardBg,
                border: `1px solid ${c.border}`,
                borderRadius: '18px',
                boxShadow: c.shadow,
                padding: '8px 12px',
              }}
            >
              {/* Plus dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={{
                    background: 'none',
                    border: `1px solid ${c.border}`,
                    borderRadius: '10px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    color: c.textSecondary,
                  }}
                >
                  <Plus size={18} />
                </button>

                {showMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '10px',
                      boxShadow: c.shadow,
                      padding: '8px 0',
                      width: '200px',
                      zIndex: 10,
                    }}
                  >
                    {['Upload a file', 'Add from Google Drive'].map((option) => (
                      <button
                        key={option}
                        onClick={() => alert(option)}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: c.text,
                          textAlign: 'left',
                          padding: '10px 14px',
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="What can I help you with today?"
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: c.text,
                  fontSize: '16px',
                  resize: 'none',
                  padding: '8px 10px',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{
                  background: c.accent,
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#fff',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  opacity: input.trim() ? 1 : 0.6,
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
