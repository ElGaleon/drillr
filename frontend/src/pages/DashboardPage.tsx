import { Link } from "react-router-dom";
import { ArrowUpRight, Heartbeat, Plus, ShieldCheck, UsersThree } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { initials } from "../lib/utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar } from "../components/ui/avatar";
import { PageHeader } from "../components/layout/AppShell";
import { WorkspaceState } from "../components/WorkspaceState";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { useState, type ReactNode } from "react";
import { PlayerFormDialog } from "../components/PlayerFormDialog";

export function DashboardPage() {
  const { selectedTeam } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const query = useQuery({ queryKey: ["dashboard", selectedTeam?.id], queryFn: () => api.dashboard(selectedTeam!.id), enabled: Boolean(selectedTeam) });
  const queryClient = query;
  return <WorkspaceState><PageHeader eyebrow="Panoramica / oggi" title={`Buongiorno, coach.`} description={`Ecco cosa succede nella tua rosa ${selectedTeam?.name ?? ""}.`} actions={<Button variant="accent" onClick={() => setDialogOpen(true)}><Plus size={18} weight="bold" />Aggiungi giocatore</Button>} />
    {query.isLoading ? <div className="stats-grid">{[1, 2, 3, 4].map((item) => <div key={item} className="stat-card skeleton-card" />)}</div> : query.error ? <Card className="state-card"><h2>Dati non disponibili</h2><p>{(query.error as Error).message}</p></Card> : query.data && <><div className="stats-grid"><StatCard label="Giocatori in rosa" value={query.data.total_players} helper="Totale profili" icon={<UsersThree size={21} />} /><StatCard label="Disponibili" value={query.data.active_players} helper="Pronti al lavoro" icon={<ShieldCheck size={21} />} tone="green" /><StatCard label="Da monitorare" value={query.data.injured_players} helper="Infortunati" icon={<Heartbeat size={21} />} tone="orange" /><StatCard label="Ultimo aggiornamento" value="Oggi" helper="Dati sincronizzati" icon={<ArrowUpRight size={21} />} tone="lavender" /></div><div className="dashboard-grid"><Card className="recent-card"><CardHeader className="card-heading-row"><div><p className="eyebrow">Rosa</p><CardTitle>Giocatori recenti</CardTitle></div><Link className="text-link" to="/players">Vedi tutti <ArrowUpRight size={15} /></Link></CardHeader><CardContent>{query.data.recent_players.length === 0 ? <div className="empty-inline"><UsersThree size={25} /><p>Nessun giocatore ancora.</p><Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>Aggiungi il primo</Button></div> : <div className="player-list">{query.data.recent_players.map((player) => <Link to={`/players/${player.id}`} className="player-row" key={player.id}><Avatar>{initials(player.first_name, player.last_name)}</Avatar><div className="player-row-main"><strong>{player.first_name} {player.last_name}</strong><span>{player.primary_role}</span></div><StatusBadge status={player.status} /><ArrowUpRight size={17} className="row-arrow" /></Link>)}</div>}</CardContent></Card><Card className="focus-card"><CardHeader><p className="eyebrow">Prossimo passo</p><CardTitle>Costruisci il profilo della rosa</CardTitle></CardHeader><CardContent><p className="card-copy">Aggiungi ruoli, note e stato di disponibilità. La base dati è pronta per innestare valutazioni e obiettivi.</p><div className="progress-line"><span style={{ width: `${Math.min(query.data.total_players * 10, 100)}%` }} /></div><div className="progress-meta"><span>Setup rosa</span><strong>{Math.min(query.data.total_players * 10, 100)}%</strong></div><Link to="/players" className="button-link">Apri gestione giocatori <ArrowUpRight size={16} /></Link></CardContent></Card></div></>}
    <PlayerFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={async (input) => { await api.createPlayer(selectedTeam!.id, input); await queryClient.refetch(); }} />
  </WorkspaceState>;
}

function StatCard({ label, value, helper, icon, tone = "default" }: { label: string; value: string | number; helper: string; icon: ReactNode; tone?: string }) { return <Card className={`stat-card stat-${tone}`}><div className="stat-icon">{icon}</div><p>{label}</p><strong>{value}</strong><span>{helper}</span></Card>; }

export function StatusBadge({ status }: { status: string }) { const labels: Record<string, [string, "success" | "warning" | "danger" | "neutral"]> = { active: ["Attivo", "success"], injured: ["Infortunato", "warning"], inactive: ["Inattivo", "neutral"] }; const [label, tone] = labels[status] ?? [status, "neutral"]; return <Badge tone={tone}>{label}</Badge>; }
