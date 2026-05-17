import { useEffect, useState } from "react";
import { AgentBadge } from "./AgentBadge";
import { AGENT_CONFIG, type AgentKey } from "@/lib/agents";

const BACKEND = import.meta.env.VITE_API_BASE || "";
const DEV_API_BASE = "http://localhost:8000";
const HISTORY_BASE = `${BACKEND || DEV_API_BASE}/history`;
const TOKEN_STORAGE_KEY = "access_token";

interface Consultation {
  consultation_id: number;
  status: string;
  started_at: string;
  diagnosis: string | null;
  treatment: string | null;
}

interface LabResult {
  order_id: number;
  test_name: string;
  order_status: string;
  findings: string | null;
  consultation_date: string;
}

interface HistorySummary {
  total_consultations: number;
  total_lab_orders: number;
  total_reports: number;
  patient_name: string;
  patient_email: string;
}

export function HistoryPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"consults" | "labs">("consults");
  const [loading, setLoading] = useState(false);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [summary, setSummary] = useState<HistorySummary | null>(null);

  useEffect(() => {
    if (!open) return;
    const fetchHistory = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return;

      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [consultRes, labRes, summaryRes] = await Promise.all([
          fetch(`${HISTORY_BASE}/consultations`, { headers }),
          fetch(`${HISTORY_BASE}/lab-results`, { headers }),
          fetch(`${HISTORY_BASE}/summary`, { headers }),
        ]);

        if (consultRes.ok) setConsultations(await consultRes.json());
        if (labRes.ok) setLabResults(await labRes.json());
        if (summaryRes.ok) setSummary(await summaryRes.json());
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 fade-in" onClick={onClose}>
      <div
        className="glass-strong relative w-full max-w-3xl overflow-hidden rounded-2xl fade-slide-in flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Medical History</h2>
            {summary && (
              <p className="text-xs text-muted-foreground">
                {summary.patient_name} • {summary.total_consultations} Consults • {summary.total_lab_orders} Labs • {summary.total_reports} Reports
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
            aria-label="Close history"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-1 border-b border-border px-5 pt-3 shrink-0">
          {(["consults", "labs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "consults" ? "Consultations" : "Lab Results"}
              {tab === t && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="scroll-area flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex justify-center p-8 text-muted-foreground text-sm">Loading records...</div>
          ) : tab === "consults" ? (
            <ul className="space-y-3">
              {consultations.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-4">No consultations yet.</div>
              ) : (
                consultations.map((c) => (
                  <li key={c.consultation_id} className="glass rounded-xl p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded-full ${c.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {c.status}
                      </span>
                      <time className="text-[11px] tabular-nums text-muted-foreground">
                        {new Date(c.started_at).toLocaleString()}
                      </time>
                    </div>
                    {c.diagnosis && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Diagnosis</span>
                        <div className="text-sm">{c.diagnosis}</div>
                      </div>
                    )}
                    {c.treatment && (
                      <div className="mt-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Treatment</span>
                        <div className="text-sm">{c.treatment}</div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Test</th>
                  <th className="pb-2 font-medium">Findings</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {labResults.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4 text-muted-foreground text-sm">No lab results yet.</td></tr>
                ) : (
                  labResults.map((l) => (
                    <tr key={l.order_id} className="border-t border-border">
                      <td className="py-3 tabular-nums text-muted-foreground">{new Date(l.consultation_date).toLocaleDateString()}</td>
                      <td className="py-3 font-medium">{l.test_name}</td>
                      <td className="py-3 max-w-[200px] truncate pr-4">{l.findings || "-"}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${l.order_status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}
                        >
                          {l.order_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export const HISTORY_AGENT_CONFIG = AGENT_CONFIG;
