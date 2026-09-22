import { WarningCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "../../shared/components/ui/button";
import { Card } from "../../shared/components/ui/card";
import { useWorkspace } from "./WorkspaceContext";

export function WorkspaceState({ children }: { children: ReactNode }) {
  const { isLoading, error, selectedTeam, openCreateTeam } = useWorkspace();
  if (isLoading) return <div className="content-loading"><div className="loading-orb" /><p>Preparing workspace…</p></div>;
  if (error) return <Card className="state-card"><WarningCircle size={25} /><h2>Workspace unavailable</h2><p>{error.message}. Start the API on localhost:8000 or configure VITE_API_URL.</p></Card>;
  if (!selectedTeam) return <Card className="state-card"><h2>Create your first team</h2><p>Each team stays separate within the same account, so you can manage multiple rosters without mixing data.</p><Button variant="accent" onClick={openCreateTeam}>Create a team</Button></Card>;
  return <>{children}</>;
}
