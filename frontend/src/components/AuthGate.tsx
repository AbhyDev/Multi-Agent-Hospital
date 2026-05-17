import React, { useState, type FormEvent } from "react";
import { Button } from "./ui/button";

const BACKEND = import.meta.env.VITE_API_BASE || "";
const DEV_API_BASE = "http://localhost:8000";
const LOGIN_URL = `${BACKEND || DEV_API_BASE}/login`;
const SIGNUP_URL = `${BACKEND || DEV_API_BASE}/users/`;
const TOKEN_STORAGE_KEY = "access_token";

export function AuthGate({ onAuthenticated }: { onAuthenticated: (token: string) => void }) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Email and password are required.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email.trim(), password: password.trim() }).toString(),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }
      const data = await response.json();
      if (!data?.access_token) {
        throw new Error("Login response missing access_token");
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      onAuthenticated(data.access_token);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim() || !age.trim() || !gender.trim()) {
      setAuthError("All fields are required.");
      return;
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      setAuthError("Please enter a valid age.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch(SIGNUP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          age: ageNum,
          gender: gender.trim(),
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Signup failed");
      }
      const loginResponse = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email.trim(), password: password.trim() }).toString(),
      });
      if (!loginResponse.ok) {
        throw new Error("Account created but login failed. Please try logging in.");
      }
      const data = await loginResponse.json();
      if (!data?.access_token) {
        throw new Error("Login response missing access_token");
      }
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        onAuthenticated(data.access_token);
      }, 2000);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Decorative orbs from index.tsx to keep the vibe */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="float-slow absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.6 0.22 230 / 0.35), transparent 60%)" }} />
        <div className="float-slow absolute bottom-[-20%] left-[-10%] h-[480px] w-[480px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.55 0.22 295 / 0.30), transparent 60%)", animationDelay: "1.5s" }} />
      </div>

      <div className="glass glow-ring w-full max-w-md rounded-3xl p-8 fade-slide-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M3 12h18" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">AI Hospital</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your AI-powered virtual medical consultation</p>
        </div>

        <div className="mb-6 flex gap-2 rounded-lg bg-black/20 p-1">
          <button
            onClick={() => { setAuthMode("login"); setAuthError(null); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${authMode === "login" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setAuthMode("signup"); setAuthError(null); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${authMode === "signup" ? "bg-white/10 text-white shadow-sm" : "text-muted-foreground hover:text-white"}`}
          >
            Sign Up
          </button>
        </div>

        {authMode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <Button type="submit" disabled={authLoading} className="w-full rounded-xl py-6 text-sm font-semibold shadow-[0_8px_24px_-10px_var(--primary)] hover:brightness-110">
              {authLoading ? "Signing in…" : "Login"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                placeholder="Full Name"
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <input
                type="email"
                value={email}
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="number"
                value={age}
                placeholder="Age"
                onChange={(e) => setAge(e.target.value)}
                min="0"
                max="150"
                className="w-1/2 rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-1/2 rounded-xl border border-border bg-black/20 px-4 py-2.5 text-sm text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 [&>option]:bg-background"
              >
                <option value="" disabled>Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Button type="submit" disabled={authLoading} className="w-full rounded-xl py-6 text-sm font-semibold shadow-[0_8px_24px_-10px_var(--primary)] hover:brightness-110">
              {authLoading ? "Creating account…" : "Create Account"}
            </Button>
          </form>
        )}

        {authError && (
          <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {authError}
          </div>
        )}

        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          Secure • Private • AI-Powered Healthcare
        </div>
      </div>
    </div>
  );
}
