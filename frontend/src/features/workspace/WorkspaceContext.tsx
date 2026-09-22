import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setTokenGetter } from "../../shared/lib/api";
import type { Team } from "../../shared/types";

type WorkspaceContextValue = {
  teams: Team[];
  selectedTeam?: Team;
  selectTeam: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
  openCreateTeam: () => void;
  createTeam: (input: Pick<Team, "name" | "season" | "accent">) => Promise<Team>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children, getToken }: { children: ReactNode; getToken: () => Promise<string | null> }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem("drillr.team") || "");
  useEffect(() => { setTokenGetter(getToken); }, [getToken]);
  const teamsQuery = useQuery({ queryKey: ["teams"], queryFn: api.teams });
  const teams = teamsQuery.data ?? [];
  const selectedTeam = teams.find((team) => team.id === selectedId) ?? teams[0];
  useEffect(() => { if (selectedTeam) { setSelectedId(selectedTeam.id); localStorage.setItem("drillr.team", selectedTeam.id); } }, [selectedTeam]);
  const createMutation = useMutation({ mutationFn: api.createTeam, onSuccess: (team) => { queryClient.setQueryData<Team[]>(["teams"], (current) => [...(current ?? []), team]); setSelectedId(team.id); navigate("/dashboard"); } });
  const value = useMemo(() => ({ teams, selectedTeam, selectTeam: (id: string) => { setSelectedId(id); localStorage.setItem("drillr.team", id); }, isLoading: teamsQuery.isLoading, error: teamsQuery.error as Error | null, openCreateTeam: () => navigate("/teams/new"), createTeam: (input: Pick<Team, "name" | "season" | "accent">) => createMutation.mutateAsync(input) }), [teams, selectedTeam, teamsQuery.isLoading, teamsQuery.error, createMutation, navigate]);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
