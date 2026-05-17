import { AGENT_CONFIG, type AgentKey } from "@/lib/agents";

export function AgentBadge({ agent, size = "md" }: { agent: AgentKey; size?: "sm" | "md" }) {
  const a = AGENT_CONFIG[agent];
  const px = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px}`}
      style={{
        color: a.color,
        background: `color-mix(in oklab, ${a.color} 14%, transparent)`,
        border: `1px solid color-mix(in oklab, ${a.color} 35%, transparent)`,
      }}
    >
      <span aria-hidden>{a.icon}</span>
      <span>{a.label}</span>
    </span>
  );
}
