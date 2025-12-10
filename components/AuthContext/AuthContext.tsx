"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  login: (data: any) => void;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("HealthCareAdmin");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (data: any) => {
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
