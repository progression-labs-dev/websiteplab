"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCookie, setCookie, clearCookie, validateCredentials, generateToken } from "./auth-utils";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: { email: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const token = getCookie();
    if (token) {
      setIsAuthenticated(true);
      setUser({ email: "demo@progressionlabs.com" });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (validateCredentials(email, password)) {
      const token = generateToken();
      setCookie(token);
      setIsAuthenticated(true);
      setUser({ email });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearCookie();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
