export type PlayerStatus = "active" | "injured" | "inactive";
export type Gender = "female" | "male" | "non_binary" | "other" | "prefer_not_to_say";
export type DominantHand = "left" | "right" | "ambidextrous" | "unknown";
export type Availability = "available" | "limited" | "unavailable";
export type RoleType = "primary" | "zone_defense";

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
  preferred_name: string | null;
  nationality: string | null;
  email: string | null;
  phone: string | null;
  photo_url: string | null;
  birth_date: string | null;
  gender: Gender | null;
  dominant_hand: DominantHand | null;
  primary_role: string;
  secondary_role: string | null;
  jersey_number: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  status: PlayerStatus;
  availability: Availability | null;
  medical_notes: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PlayerInput = Omit<Pick<Player, "first_name" | "last_name" | "preferred_name" | "nationality" | "email" | "phone" | "photo_url" | "birth_date" | "gender" | "dominant_hand" | "primary_role" | "secondary_role" | "jersey_number" | "height_cm" | "weight_kg" | "status" | "availability" | "medical_notes" | "notes">, "birth_date"> & { birth_date?: string };

export type Dashboard = {
  team: Team;
  total_players: number;
  active_players: number;
  injured_players: number;
  inactive_players: number;
  recent_players: Player[];
};

export type SkillCategory = "attack" | "defense";
export type AssessmentSource = "assessment" | "review";

export type Skill = {
  id: string;
  team_id: string;
  name: string;
  category: SkillCategory;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SkillInput = Pick<Skill, "name" | "category" | "description" | "sort_order">;
export type RoleDefinition = {
  id: string;
  team_id: string;
  name: string;
  role_type: RoleType;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type RoleInput = Pick<RoleDefinition, "name" | "role_type" | "sort_order">;
export type SkillScore = {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  score: number | null;
  source: AssessmentSource | null;
  note: string | null;
  recorded_at: string | null;
};
export type AssessmentHistory = {
  id: string;
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  score: number;
  source: AssessmentSource;
  note: string | null;
  recorded_at: string;
};
export type PlayerSkills = {
  skills: Skill[];
  current: SkillScore[];
  history: AssessmentHistory[];
};

export type Goal = {
  id: string;
  title: string;
  skill_id: string | null;
  skill_name: string | null;
  target_score: number;
  due_date: string | null;
  status: "active";
  created_at: string;
};

export type TeamAssessmentRecord = {
  player: Player;
  skills: PlayerSkills;
  goals: Goal[];
};

export type AthleticTestDirection = "higher_is_better" | "lower_is_better" | "target_range";
export type AthleticTestType = "athletic" | "technical";
export type AthleticTest = {
  id: string;
  team_id: string;
  name: string;
  category: string;
  test_type: AthleticTestType;
  unit: string;
  direction: AthleticTestDirection;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
export type AthleticTestResult = {
  id: string;
  test_id: string;
  test_name: string;
  category: string;
  unit: string;
  direction: AthleticTestDirection;
  value: number;
  note: string | null;
  recorded_at: string;
};
export type AthleticTestResultOverview = AthleticTestResult & {
  player_id: string;
  player_name: string;
  player_role: string;
};
export type Review = {
  id: string;
  player_id: string;
  review_date: string;
  strengths: string | null;
  next_steps: string | null;
  development_path: string | null;
  coach_notes: string | null;
  visibility: "staff" | "player";
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
};
export type ReviewOverview = Review & {
  player_name: string;
  player_role: string;
};
