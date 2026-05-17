import { AGENT_CONFIG, type AgentKey } from "@/lib/agents";

export interface ToolCall {
  id: string;
  name: string;
  status: "running" | "done";
  detail?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent" | "system";
  agent?: AgentKey;
  content: string;
  tools?: ToolCall[];
  pendingAsk?: boolean;
  final?: boolean;
}

export function agentTint(agent?: AgentKey) {
  if (!agent) return "var(--primary)";
  return AGENT_CONFIG[agent].color;
}
