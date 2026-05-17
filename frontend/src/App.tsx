import { useEffect, useRef, useState } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { Chat } from "@/components/Chat";
import { AgentRoster } from "@/components/AgentRoster";
import { HistoryPanel } from "@/components/HistoryPanel";
import { AuthGate } from "@/components/AuthGate";

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  // Subtle mouse parallax tilt on the main stage
  // Placed before conditional return to satisfy React rules of hooks
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--tiltX", `${x * 4}deg`);
      el.style.setProperty("--tiltY", `${-y * 3}deg`);
    };
    const reset = () => {
      el.style.setProperty("--tiltX", "0deg");
      el.style.setProperty("--tiltY", "0deg");
    };
    window.addEventListener("mousemove", handler);
    window.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseleave", reset);
    };
  }, [token]); // re-run when token changes so ref gets picked up after login

  if (!token) {
    return (
      <>
        <AuthGate onAuthenticated={setToken} />
        <SpeedInsights />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Decorative orbs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="float-slow absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.6 0.22 230 / 0.35), transparent 60%)" }} />
          <div className="float-slow absolute bottom-[-20%] left-[-10%] h-[480px] w-[480px] rounded-full" style={{ background: "radial-gradient(circle, oklch(0.55 0.22 295 / 0.30), transparent 60%)", animationDelay: "1.5s" }} />
        </div>

        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/40 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-display text-[15px] font-semibold tracking-tight">AI Hospital</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">multi-agent · langgraph</div>
              </div>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              <a href="#chat" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">Consult</a>
              <button onClick={() => setHistoryOpen(true)} className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">History</button>
              <a href="https://github.com/AbhyDev/Multi-Agent-Hospital" target="_blank" rel="noreferrer" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">GitHub</a>
            </nav>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHistoryOpen(true)}
                className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/10 md:hidden"
              >
                History
              </button>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-[11px] text-muted-foreground md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 ml-2"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-16">
          <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-slide-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> production-grade agentic AI
              </span>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                A virtual hospital
                <br />
                <span className="bg-gradient-to-r from-[oklch(0.85_0.18_220)] via-[oklch(0.78_0.18_260)] to-[oklch(0.78_0.20_300)] bg-clip-text text-transparent">
                  run by AI agents.
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                A General Physician triages your case, then routes to one of 8 specialists. Each agent reasons with{" "}
                <span className="text-foreground/90">tool calls</span>,{" "}
                <span className="text-foreground/90">ChromaDB RAG retrieval</span>, and{" "}
                <span className="text-foreground/90">live token streaming</span>—powered by LangGraph state machines.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#chat" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-10px_var(--primary)] transition-all hover:brightness-110">
                  Start a consultation <span aria-hidden>↓</span>
                </a>
                <a href="https://github.com/AbhyDev/Multi-Agent-Hospital" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-medium text-foreground/90 transition-colors hover:bg-white/10">
                  View source ↗
                </a>
              </div>
              <dl className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { k: "Agents", v: "11" },
                  { k: "Specialties", v: "8" },
                  { k: "Vector stores", v: "9" },
                ].map((s) => (
                  <div key={s.k} className="glass rounded-xl px-3 py-3">
                    <div className="font-display text-2xl font-semibold tracking-tight">{s.v}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{s.k}</div>
                  </div>
                ))}
              </dl>
            </div>

            <div ref={stageRef} className="tilt fade-in">
              <AgentRoster />
            </div>
          </div>
        </section>

        {/* Chat */}
        <section id="chat" className="mx-auto mt-14 max-w-7xl px-4 pb-16 md:px-6">
          <div className="glass-strong glow-ring overflow-hidden rounded-3xl">
            <div className="grid h-[78vh] min-h-[620px] grid-rows-[1fr]">
              <Chat />
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Powered by LangGraph multi-agent orchestration • SSE real-time streaming
          </p>
        </section>

        <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />
      </div>
      <SpeedInsights />
      <Analytics />
    </>
  );
}
