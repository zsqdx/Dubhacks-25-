import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./App";
import { Send, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  type?: "text" | "code" | "insight";
}

interface ChatPageProps {
  user?: any;
}

const ChatPage: React.FC<ChatPageProps> = ({ user }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor powered by AWS Bedrock. I can help you understand concepts, work through problems, and create personalized study plans based on your Canvas courses. What would you like to work on today?",
      isAI: true,
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const c = {
    dark: {
      bg: "#0a0a0a",
      sidebarBg: "#141414",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      accent: "#8b5cf6",
      cardBg: "#1a1a1a",
      border: "#2d2d2d",
      aiBg: "#1c1c1c",
      shadow: "0 4px 25px rgba(0,0,0,0.5)",
    },
    light: {
      bg: "#f9fafb",
      sidebarBg: "#ffffff",
      text: "#111827",
      textSecondary: "#6b7280",
      accent: "#6d28d9",
      cardBg: "#ffffff",
      border: "#e5e7eb",
      aiBg: "#f3f4f6",
      shadow: "0 8px 25px rgba(0,0,0,0.1)",
    },
  }[theme];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isAI: false,
      timestamp: new Date(),
      type: "text",
    };
    setMessages([...messages, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const sessionId = localStorage.getItem("sessionId") || undefined;
      const historyForServer = messages.slice(-10).map((m) => ({
        isAI: m.isAI,
        text: m.text,
      }));

      const base = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:3001";
      const resp = await fetch(`${base}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          history: historyForServer,
          input,
          system: "You are a helpful CS tutor. Be clear, concise, and friendly.",
        }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "AI request failed");

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text || "No text returned.",
        isAI: true,
        timestamp: new Date(),
        type: "text",
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
          type: "text",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      style={{
        background: c.bg,
        color: c.text,
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: showSidebar ? "260px" : "0px",
          transition: "width 0.3s ease",
          overflow: "hidden",
          background: c.sidebarBg,
          borderRight: `1px solid ${c.border}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {showSidebar && (
          <div style={{ padding: "20px" }}>
            <h3
              style={{
                fontSize: "13px",
                color: c.textSecondary,
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Saved Chats
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["INFO 370: Regression help", "CSE 123: Recursion practice", "Study plan before midterms"].map(
                (chat, i) => (
                  <button
                    key={i}
                    style={{
                      background: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: "8px",
                      padding: "10px",
                      color: c.text,
                      fontSize: "13px",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {chat}
                  </button>
                )
              )}
            </div>
          </div>
        )}
        {showSidebar && (
          <button
            onClick={() =>
              setMessages([
                {
                  id: "1",
                  text: "Starting a new chat. What topic would you like to review?",
                  isAI: true,
                  timestamp: new Date(),
                  type: "text",
                },
              ])
            }
            style={{
              background: c.accent,
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
              margin: "16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={15} /> New Chat
          </button>
        )}
      </aside>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: "absolute",
          left: showSidebar ? "270px" : "15px",
          top: "20px",
          background: c.cardBg,
          border: `1px solid ${c.border}`,
          borderRadius: "50%",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "left 0.3s ease",
          boxShadow: c.shadow,
          zIndex: 10,
        }}
      >
        {showSidebar ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Chat Area */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}
      >
        {/* Greeting */}
        {messages.length <= 1 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                fontSize: "42px",
                fontWeight: 700,
                color: c.text,
                marginBottom: "24px",
              }}
            >
              How are you today, {user?.name?.split(" ")[0] || "there"}?
            </h1>
          </div>
        )}

        {/* Scrollable Chat */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.isAI ? "flex-start" : "flex-end",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    background: msg.isAI ? c.aiBg : c.accent,
                    color: msg.isAI ? c.text : "white",
                    borderRadius: msg.isAI
                      ? "6px 14px 14px 14px"
                      : "14px 6px 14px 14px",
                    padding: "12px 16px",
                    maxWidth: "70%",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ color: c.textSecondary, fontSize: "13px" }}>
                AI Tutor is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div
          style={{
            background: c.cardBg,
            borderTop: `1px solid ${c.border}`,
            padding: "16px 24px",
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              maxWidth: "720px",
              background: c.cardBg,
              border: `1px solid ${c.border}`,
              borderRadius: "18px",
              padding: "8px 12px",
              boxShadow: c.shadow,
              position: "relative",
            }}
          >
            {/* Plus Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{
                  background: "none",
                  border: `1px solid ${c.border}`,
                  borderRadius: "10px",
                  padding: "8px 10px",
                  cursor: "pointer",
                  color: c.textSecondary,
                }}
              >
                <Plus size={18} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "110%",
                    left: 0,
                    background: c.cardBg,
                    border: `1px solid ${c.border}`,
                    borderRadius: "10px",
                    boxShadow: c.shadow,
                    padding: "8px 0",
                    width: "200px",
                    zIndex: 15,
                  }}
                >
                  {["Upload a file", "Add from Google Drive"].map((option) => (
                    <button
                      key={option}
                      onClick={() => alert(option)}
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        color: c.text,
                        textAlign: "left",
                        padding: "10px 14px",
                        fontSize: "14px",
                        cursor: "pointer",
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
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="What can I help you with today?"
              rows={1}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: c.text,
                fontSize: "16px",
                resize: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              style={{
                background: c.accent,
                border: "none",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#fff",
                cursor: input.trim() ? "pointer" : "not-allowed",
                opacity: input.trim() ? 1 : 0.6,
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;

