"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id?: string;
  name?: string;
  email?: string;
  systemrole?: string;
  permissions?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  login: (data: User) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("HealthCareAdmin");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (data: User) => {
    setUser(data);
    localStorage.setItem("HealthCareAdmin", JSON.stringify(data));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("HealthCareAdmin");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
