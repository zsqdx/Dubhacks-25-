import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      text: "Hi! I'm your AI Teaching Assistant. I can help you understand course materials, prepare for exams, and answer questions about your Canvas courses. What would you like to know?", 
      isAI: true 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false
    };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Great question! You asked: "${input}". \n\nThis is a mock response. In the full version, I'll provide detailed answers based on your Canvas course materials, help you study, and guide you through complex topics. Connect your backend to enable real AI responses!`,
        isAI: true
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-[calc(100vh-120px)] flex flex-col shadow-xl border-0">
        {/* Chat Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl text-white">AI Teaching Assistant</h2>
              <p className="text-sm text-blue-100">
                Ask me anything about your courses
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isAI ? 'justify-start' : 'justify-end'}`}
              >
                {msg.isAI && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.isAI
                      ? 'bg-white border border-gray-200 shadow-sm'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>

                {!msg.isAI && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-gray-200">
                      <User className="h-4 w-4 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your courses..."
              className="min-h-[60px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-[60px] w-[60px] bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
