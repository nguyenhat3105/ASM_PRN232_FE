"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function AuthGate({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { account, ready } = useAuth(); const router = useRouter();
  useEffect(() => { if (ready && (!account || (admin && account.role !== 1))) router.replace(admin && account ? "/admin" : "/login"); }, [ready, account, admin, router]);
  if (!ready || !account || (admin && account.role !== 1)) return <p className="muted">Checking your session…</p>;
  return <>{children}</>;
}
