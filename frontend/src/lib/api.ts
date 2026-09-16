import type { Dashboard, Player, PlayerInput, Team } from "../types";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");

type TokenGetter = () => Promise<string | null>;
let tokenGetter: TokenGetter = async () => null;

export function setTokenGetter(getter: TokenGetter) {
  tokenGetter = getter;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await tokenGetter();
  const headers = new Headers(options?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail || "La richiesta non è andata a buon fine");
  }
  return response.json() as Promise<T>;
}

export const api = {
  teams: () => request<Team[]>("/api/v1/teams"),
  createTeam: (input: Pick<Team, "name" | "season" | "accent">) => request<Team>("/api/v1/teams", { method: "POST", body: JSON.stringify(input) }),
  updateTeam: (id: string, input: Partial<Pick<Team, "name" | "season" | "accent">>) => request<Team>(`/api/v1/teams/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  dashboard: (teamId: string) => request<Dashboard>(`/api/v1/dashboard?team_id=${encodeURIComponent(teamId)}`),
  players: (teamId: string, search = "", status = "all") => request<Player[]>(`/api/v1/players?team_id=${encodeURIComponent(teamId)}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
  player: (teamId: string, id: string) => request<Player>(`/api/v1/players/${id}?team_id=${encodeURIComponent(teamId)}`),
  createPlayer: (teamId: string, input: PlayerInput) => request<Player>(`/api/v1/players?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  updatePlayer: (teamId: string, id: string, input: PlayerInput) => request<Player>(`/api/v1/players/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "PATCH", body: JSON.stringify(input) }),
};
