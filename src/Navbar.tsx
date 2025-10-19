import React from "react";
import { Moon, Sun, MessageSquare, LayoutDashboard } from "lucide-react";
import { useTheme } from "./App";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const c = {
    light: {
      bg: "#ffffff",
      border: "#e5e7eb",
      text: "#111827",
      textSecondary: "#6b7280",
      accent: "#6d28d9",
    },
    dark: {
      bg: "#1a1a1a",
      border: "#2d2d2d",
      text: "#f3f4f6",
      textSecondary: "#9ca3af",
      accent: "#8b5cf6",
    },
  }[theme];

  return (
    <nav
      style={{
        background: c.bg,
        borderBottom: `1px solid ${c.border}`,
        padding: "12px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Logo */}
      <div style={{ fontWeight: 700, fontSize: "18px", color: c.accent }}>
        CourseCompanion
      </div>

      {/* Center: Navigation */}
      <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: isActive("/dashboard") ? 600 : 500,
            color: isActive("/dashboard") ? c.accent : c.textSecondary,
            textDecoration: "none",
          }}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        <Link
          to="/chat"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: isActive("/chat") ? 600 : 500,
            color: isActive("/chat") ? c.accent : c.textSecondary,
            textDecoration: "none",
          }}
        >
          <MessageSquare size={18} />
          AI Chat
        </Link>
      </div>

      {/* Right: Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.text,
          padding: "6px",
          display: "flex",
          alignItems: "center",
        }}
        title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </nav>
  );
}

