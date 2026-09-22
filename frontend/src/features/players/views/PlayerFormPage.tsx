import { ArrowLeft, UserCircle } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PlayerProfileForm } from "../components/PlayerProfileForm";
import { api } from "../../../shared/lib/api";
import { Card } from "../../../shared/components/ui/card";
import { PageHeader } from "../../../shared/components/layout/AppShell";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";

export function PlayerFormPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam } = useWorkspace();
  const editing = Boolean(playerId);
  const query = useQuery({ queryKey: ["player", selectedTeam?.id, playerId], queryFn: () => api.player(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const rolesQuery = useQuery({ queryKey: ["roles", selectedTeam?.id], queryFn: () => api.roles(selectedTeam!.id), enabled: Boolean(selectedTeam) });
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof api.createPlayer>[1]) => editing ? api.updatePlayer(selectedTeam!.id, playerId!, input) : api.createPlayer(selectedTeam!.id, input),
    onSuccess: (player) => navigate(`/players/${player.id}`),
  });

  return <WorkspaceState><div className="detail-top"><Link className="back-link" to={editing ? `/players/${playerId}` : "/players"}><ArrowLeft size={16} />{editing ? "Back to profile" : "Back to players"}</Link></div>{editing && query.isLoading ? <div className="content-loading"><div className="loading-orb" /><p>Loading profile…</p></div> : editing && query.error ? <Card className="state-card"><UserCircle size={25} /><h2>Profile unavailable</h2><p>{(query.error as Error).message}</p><Link className="page-action-link" to="/players">Back to roster</Link></Card> : <><PageHeader eyebrow={editing ? "Player / edit" : "Player / new"} title={editing ? "Edit player profile" : "Create player profile"} description="Keep personal, physical, and sport context together in one profile." /><PlayerProfileForm player={query.data} roles={rolesQuery.data} onCancel={() => navigate(editing ? `/players/${playerId}` : "/players")} onSubmit={async (input) => { await mutation.mutateAsync(input); }} />{mutation.error && <p className="field-error form-submit-error">{(mutation.error as Error).message}</p>}</>}</WorkspaceState>;
}
