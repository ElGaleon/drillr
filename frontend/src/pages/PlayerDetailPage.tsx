import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarBlank, NotePencil, UserCircle } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { formatDate, initials } from "../lib/utils";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { PlayerFormDialog } from "../components/PlayerFormDialog";
import { StatusBadge } from "./DashboardPage";
import { Avatar } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { WorkspaceState } from "../components/WorkspaceState";

export function PlayerDetailPage() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam } = useWorkspace();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const query = useQuery({ queryKey: ["player", selectedTeam?.id, playerId], queryFn: () => api.player(selectedTeam!.id, playerId!), enabled: Boolean(selectedTeam && playerId) });
  const updateMutation = useMutation({ mutationFn: (input: Parameters<typeof api.updatePlayer>[2]) => api.updatePlayer(selectedTeam!.id, playerId!, input), onSuccess: (player) => { queryClient.setQueryData(["player", selectedTeam?.id, playerId], player); queryClient.invalidateQueries({ queryKey: ["players"] }); } });
  return <WorkspaceState><div className="detail-top"><Link className="back-link" to="/players"><ArrowLeft size={16} />Torna ai giocatori</Link>{query.data && <Button variant="outline" onClick={() => setEditing(true)}><NotePencil size={17} />Modifica profilo</Button>}</div>{query.isLoading ? <div className="content-loading"><div className="loading-orb" /><p>Caricamento profilo…</p></div> : query.error ? <Card className="state-card"><h2>Profilo non disponibile</h2><p>{(query.error as Error).message}</p><Button variant="outline" onClick={() => navigate("/players")}>Torna alla rosa</Button></Card> : query.data && <><section className="profile-hero"><Avatar className="profile-avatar">{initials(query.data.first_name, query.data.last_name)}</Avatar><div className="profile-heading"><p className="eyebrow">Profilo giocatore</p><h1>{query.data.first_name} {query.data.last_name}</h1><div className="profile-meta"><span>{query.data.primary_role}</span><span className="meta-dot" /> <StatusBadge status={query.data.status} /></div></div></section><div className="detail-grid"><Card><CardHeader><p className="eyebrow">Dati base</p><CardTitle>Informazioni del profilo</CardTitle></CardHeader><CardContent><div className="info-list"><InfoItem icon={<UserCircle size={18} />} label="Nome completo" value={`${query.data.first_name} ${query.data.last_name}`} /><InfoItem icon={<CalendarBlank size={18} />} label="Data di nascita" value={formatDate(query.data.birth_date)} /><InfoItem icon={<NotePencil size={18} />} label="Ruolo primario" value={query.data.primary_role} /></div></CardContent></Card><Card><CardHeader><p className="eyebrow">Note staff</p><CardTitle>Contesto operativo</CardTitle></CardHeader><CardContent>{query.data.notes ? <p className="notes-copy">{query.data.notes}</p> : <div className="empty-inline"><NotePencil size={22} /><p>Non ci sono note per questo giocatore.</p><Button variant="outline" size="sm" onClick={() => setEditing(true)}>Aggiungi nota</Button></div>}</CardContent></Card></div><Card className="roadmap-card"><CardHeader><p className="eyebrow">Prossimamente</p><CardTitle>Area sviluppo</CardTitle></CardHeader><CardContent><div className="roadmap-items"><span>Valutazioni tecniche</span><span>Obiettivi individuali</span><span>Review periodiche</span><span>Test atletici</span></div><p className="card-copy">Questa base è pronta per collegare i moduli di sviluppo previsti dalla roadmap.</p></CardContent></Card></>}
    {query.data && <PlayerFormDialog open={editing} onOpenChange={setEditing} player={query.data} onSubmit={async (input) => { await updateMutation.mutateAsync(input); }} />}</WorkspaceState>;
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="info-item"><span className="info-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>; }
