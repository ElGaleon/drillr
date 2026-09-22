import type { AssessmentSource, AthleticTest, AthleticTestResult, AthleticTestResultOverview, Dashboard, Goal, Player, PlayerInput, PlayerSkills, Review, ReviewOverview, RoleDefinition, RoleInput, Skill, SkillInput, Team, TeamAssessmentRecord } from "../types";

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
    throw new Error(body?.detail || "The request could not be completed");
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
  skills: (teamId: string) => request<Skill[]>(`/api/v1/skills?team_id=${encodeURIComponent(teamId)}`),
  createSkill: (teamId: string, input: SkillInput) => request<Skill>(`/api/v1/skills?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  updateSkill: (teamId: string, id: string, input: Partial<SkillInput> & { is_active?: boolean }) => request<Skill>(`/api/v1/skills/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "PATCH", body: JSON.stringify(input) }),
  archiveSkill: (teamId: string, id: string) => request<Skill>(`/api/v1/skills/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "DELETE" }),
  roles: (teamId: string) => request<RoleDefinition[]>(`/api/v1/roles?team_id=${encodeURIComponent(teamId)}`),
  createRole: (teamId: string, input: RoleInput) => request<RoleDefinition>(`/api/v1/roles?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  updateRole: (teamId: string, id: string, input: Partial<Pick<RoleDefinition, "name" | "sort_order" | "is_active">>) => request<RoleDefinition>(`/api/v1/roles/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "PATCH", body: JSON.stringify(input) }),
  archiveRole: (teamId: string, id: string) => request<RoleDefinition>(`/api/v1/roles/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "DELETE" }),
  playerSkills: (teamId: string, playerId: string) => request<PlayerSkills>(`/api/v1/players/${playerId}/skills?team_id=${encodeURIComponent(teamId)}`),
  playerGoals: (teamId: string, playerId: string) => request<Goal[]>(`/api/v1/players/${playerId}/goals?team_id=${encodeURIComponent(teamId)}`),
  createGoal: (teamId: string, playerId: string, input: Pick<Goal, "title" | "skill_id" | "target_score" | "due_date">) => request<Goal>(`/api/v1/players/${playerId}/goals?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  createAssessment: (teamId: string, playerId: string, input: { source: AssessmentSource; note?: string; ratings: Array<{ skill_id: string; score: number; note?: string }> }) => request<PlayerSkills>(`/api/v1/players/${playerId}/assessments?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  athleticTests: (teamId: string) => request<AthleticTest[]>(`/api/v1/athletic-tests?team_id=${encodeURIComponent(teamId)}`),
  createAthleticTest: (teamId: string, input: Pick<AthleticTest, "name" | "category" | "test_type" | "unit" | "direction" | "sort_order">) => request<AthleticTest>(`/api/v1/athletic-tests?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  updateAthleticTest: (teamId: string, id: string, input: Partial<Pick<AthleticTest, "name" | "category" | "test_type" | "unit" | "direction" | "sort_order" | "is_active">>) => request<AthleticTest>(`/api/v1/athletic-tests/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "PATCH", body: JSON.stringify(input) }),
  archiveAthleticTest: (teamId: string, id: string) => request<AthleticTest>(`/api/v1/athletic-tests/${id}?team_id=${encodeURIComponent(teamId)}`, { method: "DELETE" }),
  playerAthleticTests: (teamId: string, playerId: string) => request<AthleticTestResult[]>(`/api/v1/players/${playerId}/athletic-tests?team_id=${encodeURIComponent(teamId)}`),
  athleticTestResults: (teamId: string, filters: { playerId?: string; testId?: string; category?: string } = {}) => request<AthleticTestResultOverview[]>(`/api/v1/athletic-test-results?team_id=${encodeURIComponent(teamId)}${filters.playerId ? `&player_id=${encodeURIComponent(filters.playerId)}` : ""}${filters.testId ? `&test_id=${encodeURIComponent(filters.testId)}` : ""}${filters.category ? `&category=${encodeURIComponent(filters.category)}` : ""}`),
  createAthleticTestResult: (teamId: string, playerId: string, input: { test_id: string; value: number; note?: string; recorded_at?: string }) => request<AthleticTestResult>(`/api/v1/players/${playerId}/athletic-tests?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  playerReviews: (teamId: string, playerId: string) => request<Review[]>(`/api/v1/players/${playerId}/reviews?team_id=${encodeURIComponent(teamId)}`),
  reviews: (teamId: string, filters: { playerId?: string; status?: string; visibility?: string } = {}) => request<ReviewOverview[]>(`/api/v1/reviews?team_id=${encodeURIComponent(teamId)}${filters.playerId ? `&player_id=${encodeURIComponent(filters.playerId)}` : ""}${filters.status ? `&review_status=${encodeURIComponent(filters.status)}` : ""}${filters.visibility ? `&visibility=${encodeURIComponent(filters.visibility)}` : ""}`),
  createReview: (teamId: string, playerId: string, input: { review_date: string; strengths?: string; next_steps?: string; development_path?: string; coach_notes?: string; visibility: "staff" | "player"; status: "draft" | "published" }) => request<Review>(`/api/v1/players/${playerId}/reviews?team_id=${encodeURIComponent(teamId)}`, { method: "POST", body: JSON.stringify(input) }),
  teamAssessments: async (teamId: string): Promise<TeamAssessmentRecord[]> => {
    const players = await api.players(teamId);
    return Promise.all(players.map(async (player) => {
      const [skills, goals] = await Promise.all([api.playerSkills(teamId, player.id), api.playerGoals(teamId, player.id)]);
      return { player, skills, goals };
    }));
  },
};
