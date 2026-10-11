"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { Account, useAuth } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter(); const { login } = useAuth(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const data = new FormData(e.currentTarget); setBusy(true); setError(""); try { const result = await api<{ token: string; account: Account }>("/auth/login", { method: "POST", body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); login(result.token, result.account); router.replace("/admin"); } catch (e) { setError(e instanceof Error ? e.message : "Could not sign in."); } finally { setBusy(false); } }
  return <form className="auth-form" onSubmit={submit}><h1>Welcome back</h1><p>Sign in to manage your workspace.</p><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="field-error">{error}</p>}<button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button><p>Need an account? <Link href="/register">Register</Link></p></form>;
}

export function RegisterForm() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); const data = new FormData(e.currentTarget); const password = String(data.get("password") || ""); if (password !== data.get("confirmPassword")) { setError("Passwords do not match."); return; } if (password.length < 8) { setError("Password must have at least 8 characters."); return; } setBusy(true); setError(""); try { await api("/auth/register", { method: "POST", body: JSON.stringify({ fullName: data.get("fullName"), email: data.get("email"), password }) }); toast.success("Registration complete. Please sign in."); router.replace("/login"); } catch (e) { setError(e instanceof ApiError ? e.message : "Could not register."); } finally { setBusy(false); } }
  return <form className="auth-form" onSubmit={submit}><h1>Create your account</h1><p>New accounts start with Staff access.</p><label>Full name<input name="fullName" required minLength={2} maxLength={150} autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" required minLength={8} autoComplete="new-password" /></label><label>Confirm password<input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label>{error && <p className="field-error">{error}</p>}<button className="button" disabled={busy}>{busy ? "Creating…" : "Create account"}</button><p>Already registered? <Link href="/login">Sign in</Link></p></form>;
}
