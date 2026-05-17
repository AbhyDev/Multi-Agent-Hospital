import { useEffect, useRef, useState } from "react";
import { AGENT_CONFIG, type AgentKey } from "@/lib/agents";
import { AgentBadge } from "./AgentBadge";
import { Markdown } from "./Markdown";
import type { ChatMessage, ToolCall } from "@/lib/chat-types";

const BACKEND = import.meta.env.VITE_API_BASE || "";
const DEV_API_BASE = "http://localhost:8000";
const TOKEN_STORAGE_KEY = "access_token";

const SUGGESTIONS = [
  "I've been having recurring headaches for a week",
  "An itchy red rash appeared on my forearm",
  "I'm feeling anxious and can't sleep",
  "My knee hurts after running",
];

export function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content:
        "**Welcome to AI Hospital.** Describe your symptoms and the General Physician will route you to the right specialist. Multi-agent reasoning runs live; tool calls and RAG retrievals stream in real time.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [pendingAsk, setPendingAsk] = useState<{ thread_id: string; speaker?: string; current_agent?: string } | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAgentRef = useRef<string>("GP");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const mapAgentKey = (speaker?: string): AgentKey => {
    if (!speaker) return "GP";
    if (AGENT_CONFIG[speaker as AgentKey]) return speaker as AgentKey;
    const key = Object.keys(AGENT_CONFIG).find((k) =>
      speaker.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(speaker.toLowerCase())
    );
    return (key as AgentKey) || "GP";
  };

  const handleEventSource = (url: string) => {
    const es = new EventSource(url);
    setStreaming(true);

    es.addEventListener("thread", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setThreadId(data.thread_id);
      currentAgentRef.current = "GP";
    });

    es.addEventListener("message", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data.current_agent) currentAgentRef.current = data.current_agent;
      if (!data.content?.trim()) return;
      
      const speakerKey = mapAgentKey(data.speaker || currentAgentRef.current);
      
      setMessages((prev) => {
        const next = [...prev];
        let idx = -1;
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "agent" && next[i].agent === speakerKey && !next[i].pendingAsk && !next[i].final) { 
            idx = i; 
            break; 
          }
        }
        if (idx === -1) {
          next.push({ id: `m_${crypto.randomUUID()}`, role: "agent", agent: speakerKey, content: data.content, tools: [] });
        } else {
          next[idx] = { ...next[idx], content: next[idx].content + data.content };
        }
        return next;
      });
    });

    es.addEventListener("tool", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data.current_agent) currentAgentRef.current = data.current_agent;
      const speakerKey = mapAgentKey(data.agent || currentAgentRef.current);

      setMessages((prev) => {
        const next = [...prev];
        let idx = -1;
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "agent" && next[i].agent === speakerKey && !next[i].pendingAsk && !next[i].final) { 
            idx = i; 
            break; 
          }
        }
        
        let targetIdx = idx;
        if (idx === -1) {
          next.push({ id: `m_${crypto.randomUUID()}`, role: "agent", agent: speakerKey, content: "", tools: [] });
          targetIdx = next.length - 1;
        }

        const target = next[targetIdx];
        const tools = target.tools ? [...target.tools] : [];
        // Add or update tool
        if (!tools.some(t => t.id === data.id)) {
           tools.push({ id: data.id, name: data.name, status: "done", detail: JSON.stringify(data.args) });
        }
        next[targetIdx] = { ...target, tools };
        return next;
      });
    });

    es.addEventListener("ask_user", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data.current_agent) currentAgentRef.current = data.current_agent;
      setPendingAsk(data);
      setStreaming(false);

      const speakerKey = mapAgentKey(data.speaker || currentAgentRef.current);
      setMessages((prev) => {
        const next = [...prev];
        // Find the last agent message from this speaker
        let lastIdx = -1;
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].role === "agent" && next[i].agent === speakerKey && !next[i].final) {
            lastIdx = i;
            break;
          }
        }

        if (lastIdx !== -1) {
          // Mark the existing message as pendingAsk
          // If the message has no text content yet, use the ask_user question
          const existing = next[lastIdx];
          next[lastIdx] = {
            ...existing,
            pendingAsk: true,
            content: existing.content?.trim() ? existing.content : (data.question || ""),
          };
        } else if (data.question?.trim()) {
          // No prior message from this agent — add the question as a new message
          next.push({
            id: `ask_${crypto.randomUUID()}`,
            role: "agent",
            agent: speakerKey,
            content: data.question,
            pendingAsk: true,
          });
        }
        return next;
      });
      es.close();
    });

    es.addEventListener("final", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data.current_agent) currentAgentRef.current = data.current_agent;
      setStreaming(false);
      
      if (data.message) {
        setMessages((prev) => [
          ...prev, 
          { id: `final_${crypto.randomUUID()}`, role: "system", content: `✅ Consultation complete — ${data.message}`, final: true }
        ]);
      }
      es.close();
    });

    es.onerror = () => {
      setStreaming(false);
      es.close();
    };
  };

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    
    const activeToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!activeToken) return;

    setMessages((m) => [...m, { id: `u_${crypto.randomUUID()}`, role: "user", content: text }]);
    setPendingAsk(null);

    if (threadId && pendingAsk?.thread_id === threadId) {
      const url = `${BACKEND || DEV_API_BASE}/graph/resume/stream?thread_id=${encodeURIComponent(threadId)}&user_reply=${encodeURIComponent(text)}&token=${encodeURIComponent(activeToken)}`;
      handleEventSource(url);
    } else {
      const url = `${BACKEND || DEV_API_BASE}/graph/start/stream?message=${encodeURIComponent(text)}&token=${encodeURIComponent(activeToken)}`;
      handleEventSource(url);
    }
  }

  function newConsultation() {
    setMessages([
      {
        id: "welcome",
        role: "system",
        content: "**New consultation started.** Describe your symptoms below.",
      },
    ]);
    setPendingAsk(null);
    setThreadId(null);
    setStreaming(false);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {threadId ? <span className="font-mono">thread {threadId}</span> : <span>idle</span>}
        </div>
        <button
          onClick={newConsultation}
          className="rounded-md border border-border bg-white/5 px-2.5 py-1 text-xs font-medium text-foreground/90 transition-colors hover:bg-white/10"
        >
          + New consultation
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scroll-area min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <ul className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((m) => (
            <li key={m.id} className="fade-slide-in">
              {m.role === "user" ? (
                <UserBubble content={m.content} />
              ) : m.role === "system" ? (
                <SystemBubble content={m.content} final={m.final} />
              ) : (
                <AgentBubble msg={m} />
              )}
            </li>
          ))}
          {streaming && <li><TypingIndicator currentAgent={mapAgentKey(currentAgentRef.current)} /></li>}
        </ul>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-background/40 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-3xl">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border bg-white/5 px-3 py-1 text-xs text-foreground/85 transition-colors hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="glass flex items-end gap-2 rounded-2xl p-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={pendingAsk ? "Reply to the doctor's question…" : "Describe your symptoms…"}
              rows={1}
              className="min-h-[40px] max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-10px_var(--primary)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {streaming ? "Streaming…" : pendingAsk ? "Reply" : "Send"}
              <span aria-hidden>↗</span>
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Live connection to LangGraph backend • Server-Sent Events (SSE) active
          </p>
        </div>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary/90 px-4 py-2.5 text-sm text-primary-foreground shadow-[0_10px_30px_-15px_var(--primary)]">
        {content}
      </div>
    </div>
  );
}

function SystemBubble({ content, final }: { content: string; final?: boolean }) {
  return (
    <div className="flex justify-center">
      <div
        className={`glass rounded-xl px-4 py-2.5 text-center text-xs ${final ? "text-emerald-300" : "text-muted-foreground"}`}
        style={final ? { borderColor: "color-mix(in oklab, oklch(0.78 0.18 145) 40%, transparent)" } : undefined}
      >
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}

function AgentBubble({ msg }: { msg: ChatMessage }) {
  const agent = msg.agent || "GP";
  const tint = AGENT_CONFIG[agent].color;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <AgentBadge agent={agent} />
        {msg.pendingAsk && (
          <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
            awaiting reply
          </span>
        )}
      </div>
      {msg.tools && msg.tools.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {msg.tools.map((t) => (
            <ToolChip key={t.id} tool={t} tint={tint} />
          ))}
        </div>
      )}
      {msg.content && (
        <div
          className="glass max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-foreground/95"
          style={{
            borderColor: `color-mix(in oklab, ${tint} 28%, transparent)`,
            background: `linear-gradient(180deg, color-mix(in oklab, ${tint} 8%, transparent), color-mix(in oklab, ${tint} 3%, var(--card)))`,
          }}
        >
          <Markdown>{msg.content}</Markdown>
        </div>
      )}
    </div>
  );
}

function ToolChip({ tool, tint }: { tool: ToolCall; tint: string }) {
  const running = tool.status === "running";
  const hasArgs = tool.detail && tool.detail !== "{}";
  return (
    <div
      className="flex flex-col self-start rounded-xl text-xs"
      style={{
        background: `color-mix(in oklab, ${tint} 10%, transparent)`,
        border: `1px solid color-mix(in oklab, ${tint} 25%, transparent)`,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: tint }}>🔧 {tool.name}</span>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold ${running ? "text-amber-300" : "text-emerald-300"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${running ? "animate-pulse bg-amber-300" : "bg-emerald-300"}`} />
          {running ? "running" : "done"}
        </span>
      </div>
      {hasArgs && (
        <details className="border-t px-3 py-1.5" style={{ borderColor: `color-mix(in oklab, ${tint} 15%, transparent)` }}>
          <summary className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground select-none">args</summary>
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-muted-foreground">{tool.detail}</pre>
        </details>
      )}
    </div>
  );
}

function TypingIndicator({ currentAgent }: { currentAgent: AgentKey }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <AgentBadge agent={currentAgent} />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground glass max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="text-xs">processing</span>
        <span className="flex"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></span>
      </div>
    </div>
  );
}
