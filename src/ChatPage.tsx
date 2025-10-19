import React, { useState } from 'react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hi! I'm your AI Teaching Assistant. Ask me anything!", isAI: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false
    };
    setMessages([...messages, userMessage]);

    // Mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `You asked: "${input}". This is a mock response - connect your backend for real AI!`,
        isAI: true
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>AI Teaching Assistant</h1>

      <div style={{
        border: '1px solid #ccc',
        height: '400px',
        overflowY: 'scroll',
        padding: '10px',
        marginBottom: '10px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              textAlign: msg.isAI ? 'left' : 'right',
              margin: '10px 0'
            }}
          >
            <div style={{
              display: 'inline-block',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: msg.isAI ? '#e3f2fd' : '#c8e6c9'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          style={{ flex: 1, padding: '10px', fontSize: '16px' }}
        />
        <button
          onClick={handleSend}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
