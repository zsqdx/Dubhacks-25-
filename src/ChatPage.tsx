import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hi! I'm your AI Teaching Assistant. I can help you understand course material, generate practice problems, and identify areas where you might need extra support. What would you like to work on today?", 
      isAI: true,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      isAI: false,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    const conversationPayload = updatedMessages.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: msg.text
    }));

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: "You are a friendly and knowledgeable AI teaching assistant that helps students understand Canvas course material, generate study tips, and explain difficult concepts in approachable language.",
          messages: conversationPayload
        })
      });

      if (!response.ok) {
        let errorDetails = 'Failed to reach teaching assistant';
        const contentType = response.headers.get('content-type') || '';

        try {
          if (contentType.includes('application/json')) {
            const errorJson = await response.json();
            if (errorJson && typeof errorJson.error === 'string') {
              errorDetails = errorJson.error;
            } else if (typeof errorJson === 'string' && errorJson.trim()) {
              errorDetails = errorJson.trim();
            }
          } else {
            const errorText = await response.text();
            if (errorText.trim()) {
              errorDetails = errorText.trim();
            }
          }
        } catch (parseError) {
          console.warn('Unable to parse error response from teaching assistant:', parseError);
        }

        throw new Error(errorDetails || 'Failed to reach teaching assistant');
      }

      const data = await response.json();
      const aiText = typeof data.text === 'string' ? data.text : 'I had trouble understanding that request, but I am here to help with anything else about your courses!';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        isAI: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorDescription = error instanceof Error ? error.message : 'Unknown error occurred';
      const normalized = errorDescription.toLowerCase();

      let troubleshootingTip = 'Please try again in a moment while we look into this.';

      if (normalized.includes('failed to fetch') || normalized.includes('fetch failed') || normalized.includes('network')) {
        troubleshootingTip = 'It looks like the SnapSyllabus server might be offline. Make sure the backend is running (npm run dev:backend or npm run server) and that you can reach http://localhost:3001/api/chat from your browser.';
      } else if (normalized.includes('failed to generate ai response') || normalized.includes('bedrock') || normalized.includes('credential')) {
        troubleshootingTip = 'The backend could not reach the Bedrock model. Double-check your AWS credentials or BEDROCK_API_KEY environment variables and review the server logs for details.';
      }

      const detailedMessage = `${troubleshootingTip}\n\nError details: ${errorDescription}`;

      const errorReply: Message = {
        id: (Date.now() + 2).toString(),
        text: `Sorry, I ran into a problem while generating a response. ${detailedMessage}`,
        isAI: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{
      height: 'calc(100vh - 60px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to bottom, #f7f9fc 0%, #ffffff 100%)',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '20px 30px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#111827', fontWeight: '600' }}>
            AI Teaching Assistant
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Powered by Canvas course data • Always learning with you
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '30px 20px',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.isAI ? 'flex-start' : 'flex-end',
                marginBottom: '24px',
                animation: 'fadeIn 0.3s ease-in',
              }}
            >
              <div style={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}>
                {/* Avatar & Name */}
                {msg.isAI && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: 'white',
                      fontWeight: '600',
                    }}>
                      AI
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                      Teaching Assistant
                    </span>
                  </div>
                )}
                
                {/* Message Bubble */}
                <div style={{
                  padding: '14px 18px',
                  borderRadius: msg.isAI ? '8px 18px 18px 18px' : '18px 8px 18px 18px',
                  background: msg.isAI 
                    ? 'white'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: msg.isAI ? '#1f2937' : 'white',
                  boxShadow: msg.isAI 
                    ? '0 2px 8px rgba(0,0,0,0.08)'
                    : '0 4px 12px rgba(102, 126, 234, 0.3)',
                  lineHeight: '1.6',
                  fontSize: '15px',
                }}>
                  {msg.text}
                </div>
                
                {/* Timestamp */}
                <div style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginLeft: msg.isAI ? '36px' : '0',
                  textAlign: msg.isAI ? 'left' : 'right',
                }}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '24px',
            }}>
              <div style={{ maxWidth: '75%' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    color: 'white',
                    fontWeight: '600',
                  }}>
                    AI
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                    Teaching Assistant
                  </span>
                </div>
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px 18px 18px 18px',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginLeft: '0',
                }}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out',
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out 0.2s',
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#9ca3af',
                      animation: 'bounce 1.4s infinite ease-in-out 0.4s',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            background: '#f9fafb',
            padding: '8px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
          onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about assignments, request practice problems, or get help catching up..."
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '15px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: '#111827',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                padding: '12px 24px',
                background: !input.trim() || isTyping 
                  ? '#e5e7eb' 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: !input.trim() || isTyping ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: !input.trim() || isTyping 
                  ? 'none' 
                  : '0 4px 12px rgba(102, 126, 234, 0.3)',
              }}
              onMouseOver={(e) => {
                if (input.trim() && !isTyping) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = !input.trim() || isTyping 
                  ? 'none' 
                  : '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              Send →
            </button>
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: '#9ca3af', 
            margin: '8px 0 0 0',
            textAlign: 'center'
          }}>
            Press Enter to send • Connected to your Canvas courses
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
