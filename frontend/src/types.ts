export type PlayerStatus = "active" | "injured" | "inactive";

export type Team = {
  id: string;
  name: string;
  season: string;
  accent: string;
  player_count: number;
};

export type Player = {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
  birth_date: string | null;
  primary_role: string;
  status: PlayerStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerInput = Omit<Pick<Player, "first_name" | "last_name" | "birth_date" | "primary_role" | "status" | "notes">, "birth_date"> & { birth_date?: string };

export type Dashboard = {
  team: Team;
  total_players: number;
  active_players: number;
  injured_players: number;
  inactive_players: number;
  recent_players: Player[];
};
