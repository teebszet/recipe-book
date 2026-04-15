"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  showAuthModal: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "recipe-book-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (password: string) => {
    // Verify password by making a test request
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${password}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      sessionStorage.setItem(SESSION_KEY, password);
      setIsAuthenticated(true);
      setShowAuthModal(false);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const password = sessionStorage.getItem(SESSION_KEY);
    if (!password) return {};
    return { Authorization: `Bearer ${password}` };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        showAuthModal,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
