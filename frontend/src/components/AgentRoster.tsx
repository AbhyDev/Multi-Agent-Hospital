import { ALL_AGENTS } from "@/lib/agents";

export function AgentRoster() {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-foreground/90">Specialists on call</h3>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{ALL_AGENTS.length} agents</span>
      </div>
      <ul className="grid grid-cols-2 gap-1.5">
        {ALL_AGENTS.map((a) => (
          <li
            key={a.key}
            className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors"
            style={{
              background: `color-mix(in oklab, ${a.color} 6%, transparent)`,
              border: `1px solid color-mix(in oklab, ${a.color} 18%, transparent)`,
            }}
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-md text-sm"
              style={{
                background: `color-mix(in oklab, ${a.color} 18%, transparent)`,
                color: a.color,
              }}
            >
              {a.icon}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-medium text-foreground/95">{a.label}</div>
              <div className="truncate text-[10px] text-muted-foreground">{a.blurb}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
