"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Account = { accountId: number; fullName: string; email: string; role: number; createdDate: string };
type AuthState = { account: Account | null; ready: boolean; login: (token: string, account: Account) => void; logout: () => void };
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem("tasktrack-account"); if (raw && localStorage.getItem("tasktrack-token")) setAccount(JSON.parse(raw)); } catch {} finally { setReady(true); } }, []);
  const login = (token: string, next: Account) => { localStorage.setItem("tasktrack-token", token); localStorage.setItem("tasktrack-account", JSON.stringify(next)); setAccount(next); };
  const logout = () => { localStorage.removeItem("tasktrack-token"); localStorage.removeItem("tasktrack-account"); setAccount(null); };
  return <AuthContext.Provider value={{ account, ready, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("AuthProvider is missing"); return value; }
