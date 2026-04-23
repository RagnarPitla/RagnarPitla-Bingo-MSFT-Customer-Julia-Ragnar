// Azure Functions API client — replaces Supabase throughout the app.
// All state lives in Azure Table Storage, accessed via /api/* endpoints.

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  company: string;
  role: "dealer" | "player";
  created_at: string;
}

export interface Selection {
  participant_id: string;
  agent_key: string;
}

export interface GameState {
  id: string;
  current_card_index: number;
  reviewing_card_key: string | null;
}

// ─── Participants ─────────────────────────────────────────────────────────────

export const participants = {
  list: () => request<Participant[]>("/participants"),

  create: (data: { name: string; company: string; role: "dealer" | "player" }) =>
    request<Participant>("/participants", { method: "POST", body: JSON.stringify(data) }),

  deleteAll: () =>
    request<{ ok: boolean }>("/participants", { method: "DELETE" }),
};

// ─── Selections ───────────────────────────────────────────────────────────────

export const selections = {
  list: () => request<Selection[]>("/selections"),

  create: (data: { participant_id: string; agent_key: string }) =>
    request<{ ok: boolean }>("/selections", { method: "POST", body: JSON.stringify(data) }),

  delete: (participantId: string, agentKey: string) =>
    request<{ ok: boolean }>(
      `/selections?participantId=${encodeURIComponent(participantId)}&agentKey=${encodeURIComponent(agentKey)}`,
      { method: "DELETE" }
    ),

  deleteAll: () =>
    request<{ ok: boolean }>("/selections", { method: "DELETE" }),
};

// ─── Game State ───────────────────────────────────────────────────────────────

export const gameState = {
  get: () => request<GameState>("/gamestate"),

  update: (data: { current_card_index?: number; reviewing_card_key?: string | null }) =>
    request<GameState>("/gamestate", { method: "PATCH", body: JSON.stringify(data) }),
};

// ─── Reset ────────────────────────────────────────────────────────────────────

export const resetGame = () =>
  request<{ ok: boolean }>("/reset", { method: "POST" });
