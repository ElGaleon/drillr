import { WarningCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useWorkspace } from "../workspace/WorkspaceContext";

export function WorkspaceState({ children }: { children: ReactNode }) {
  const { isLoading, error, selectedTeam, openCreateTeam } = useWorkspace();
  if (isLoading) return <div className="content-loading"><div className="loading-orb" /><p>Preparazione del workspace…</p></div>;
  if (error) return <Card className="state-card"><WarningCircle size={25} /><h2>Workspace non raggiungibile</h2><p>{error.message}. Avvia l’API su `localhost:8000` oppure configura `VITE_API_URL`.</p></Card>;
  if (!selectedTeam) return <Card className="state-card"><h2>Inizia creando il tuo primo team</h2><p>Ogni team resta separato nello stesso account, così puoi lavorare su più rose senza mescolare i dati.</p><Button variant="accent" onClick={openCreateTeam}>Crea un team</Button></Card>;
  return <>{children}</>;
}
