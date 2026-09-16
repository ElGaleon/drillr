import { useState } from "react";
import { Link } from "react-router-dom";
import { MagnifyingGlass, Plus, SlidersHorizontal, UserPlus } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { initials } from "../lib/utils";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { PageHeader } from "../components/layout/AppShell";
import { WorkspaceState } from "../components/WorkspaceState";
import { PlayerFormDialog } from "../components/PlayerFormDialog";
import { Avatar } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { StatusBadge } from "./DashboardPage";

export function PlayersPage() {
  const { selectedTeam } = useWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = useQuery({ queryKey: ["players", selectedTeam?.id, search, status], queryFn: () => api.players(selectedTeam!.id, search, status), enabled: Boolean(selectedTeam) });
  const createMutation = useMutation({ mutationFn: (input: Parameters<typeof api.createPlayer>[1]) => api.createPlayer(selectedTeam!.id, input), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["players"] }) });
  return <WorkspaceState><PageHeader eyebrow="Rosa / gestione" title="Giocatori" description={`${selectedTeam?.player_count ?? 0} profili nel team ${selectedTeam?.name ?? ""}.`} actions={<Button variant="accent" onClick={() => setDialogOpen(true)}><Plus size={18} weight="bold" />Nuovo giocatore</Button>} /><Card className="players-card"><CardContent className="players-card-content"><div className="filters-row"><div className="search-wrap"><MagnifyingGlass size={18} /><Input aria-label="Cerca giocatori" placeholder="Cerca per nome o cognome…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-wrap"><SlidersHorizontal size={17} /><select className="filter-select" aria-label="Filtra per stato" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Tutti gli stati</option><option value="active">Attivi</option><option value="injured">Infortunati</option><option value="inactive">Inattivi</option></select></div><Badge>{query.data?.length ?? 0} risultati</Badge></div>{query.isLoading ? <div className="table-skeleton">{[1, 2, 3, 4].map((item) => <div className="skeleton-row" key={item} />)}</div> : query.error ? <div className="empty-state"><p>Non riesco a caricare i giocatori.</p><span>{(query.error as Error).message}</span></div> : query.data?.length ? <div className="players-table-wrap"><table className="players-table"><thead><tr><th>Giocatore</th><th>Ruolo</th><th>Stato</th><th className="table-action-col" /></tr></thead><tbody>{query.data.map((player) => <tr key={player.id}><td><Link className="player-cell" to={`/players/${player.id}`}><Avatar>{initials(player.first_name, player.last_name)}</Avatar><span><strong>{player.first_name} {player.last_name}</strong><small>Profilo giocatore</small></span></Link></td><td><span className="role-text">{player.primary_role}</span></td><td><StatusBadge status={player.status} /></td><td className="table-action-col"><Link className="row-edit" to={`/players/${player.id}`}>Apri</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><UserPlus size={25} /></div><h2>La rosa è ancora vuota</h2><p>Aggiungi il primo profilo per iniziare a raccogliere il contesto della squadra.</p><Button variant="accent" onClick={() => setDialogOpen(true)}><Plus size={18} />Aggiungi giocatore</Button></div>}</CardContent></Card><PlayerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={async (input) => { await createMutation.mutateAsync(input); }} /></WorkspaceState>;
}
