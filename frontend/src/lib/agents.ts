export type AgentKey =
  | "GP"
  | "Ophthalmologist"
  | "Dermatologist"
  | "ENT"
  | "Gynecologist"
  | "Psychiatrist"
  | "Internal Medicine"
  | "Pathologist"
  | "Radiologist"
  | "Pediatrician"
  | "Orthopedist";

export interface AgentMeta {
  key: AgentKey;
  label: string;
  icon: string;
  color: string; // CSS var
  blurb: string;
}

export const AGENT_CONFIG: Record<AgentKey, AgentMeta> = {
  GP: { key: "GP", label: "General Physician", icon: "👨‍⚕️", color: "var(--agent-gp)", blurb: "Triage & routing" },
  Ophthalmologist: { key: "Ophthalmologist", label: "Ophthalmology", icon: "👁️", color: "var(--agent-ophthalmology)", blurb: "Eyes & vision" },
  Dermatologist: { key: "Dermatologist", label: "Dermatology", icon: "🧴", color: "var(--agent-dermatology)", blurb: "Skin, hair, nails" },
  ENT: { key: "ENT", label: "ENT", icon: "👂", color: "var(--agent-ent)", blurb: "Ear, nose & throat" },
  Gynecologist: { key: "Gynecologist", label: "Gynecology", icon: "🩺", color: "var(--agent-gynecology)", blurb: "Women's health" },
  Psychiatrist: { key: "Psychiatrist", label: "Psychiatry", icon: "🧠", color: "var(--agent-psychiatry)", blurb: "Mental health" },
  "Internal Medicine": { key: "Internal Medicine", label: "Internal Medicine", icon: "💊", color: "var(--agent-internal)", blurb: "Adult systemic care" },
  Pathologist: { key: "Pathologist", label: "Pathology", icon: "🔬", color: "var(--agent-pathology)", blurb: "Lab analysis" },
  Radiologist: { key: "Radiologist", label: "Radiology", icon: "📡", color: "var(--agent-radiology)", blurb: "Imaging review" },
  Pediatrician: { key: "Pediatrician", label: "Pediatrics", icon: "👶", color: "var(--agent-pediatrics)", blurb: "Child health" },
  Orthopedist: { key: "Orthopedist", label: "Orthopedics", icon: "🦴", color: "var(--agent-orthopedics)", blurb: "Bones & joints" },
};

export const ALL_AGENTS = Object.values(AGENT_CONFIG);
