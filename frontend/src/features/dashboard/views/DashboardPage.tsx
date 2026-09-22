import {type ReactNode} from "react";
import {
    ArrowUpRightIcon,
    HeartbeatIcon, PlusIcon,
    ShieldCheckIcon,
    UsersThreeIcon
} from "@phosphor-icons/react";
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {api} from "../../../shared/lib/api";
import {initials} from "../../../shared/lib/utils";
import {Avatar} from "../../../shared/components/ui/avatar";
import {Badge} from "../../../shared/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "../../../shared/components/ui/card";
import {PageHeader} from "../../../shared/components/layout/AppShell";
import {useWorkspace} from "../../workspace/WorkspaceContext";
import {WorkspaceState} from "../../workspace/WorkspaceState";

export function DashboardPage() {
    const {selectedTeam} = useWorkspace();
    const query = useQuery({
        queryKey: ["dashboard", selectedTeam?.id],
        queryFn: () => api.dashboard(selectedTeam!.id),
        enabled: Boolean(selectedTeam)
    });

    return (
        <WorkspaceState>
            <PageHeader eyebrow="Overview / today" title="Good morning, coach."
                        description={`Here’s what is happening in ${selectedTeam?.name ?? "your team"}.`}
                        actions={<Link className="page-action-link" to="/players/new"><PlusIcon size={18} weight="bold"/>Add
                            player</Link>}/>
            {query.isLoading ? <div className="stats-grid">{[1, 2, 3, 4].map((item) => <div key={item}
                                                                                            className="stat-card skeleton-card"/>)}</div> : query.error ?
                <Card className="state-card"><h2>Data unavailable</h2><p>{(query.error as Error).message}</p>
                </Card> : query.data && <>
                <div className="stats-grid"><StatCard label="Roster players" value={query.data.total_players}
                                                      helper="Total profiles" icon={<UsersThreeIcon size={20}/>}/><StatCard
                    label="Available" value={query.data.active_players} helper="Ready to work"
                    icon={<ShieldCheckIcon size={21}/>} tone="green"/><StatCard label="Monitor"
                                                                            value={query.data.injured_players}
                                                                            helper="Injured players"
                                                                            icon={<HeartbeatIcon size={20}/>}
                                                                            tone="orange"/><StatCard
                    label="Last updated" value="Today" helper="Data synced" icon={<ArrowUpRightIcon size={20}/>}
                    tone="lavender"/></div>
                <div className="dashboard-grid"><Card className="recent-card"><CardHeader className="card-heading-row">
                    <div><p className="eyebrow">Roster</p><CardTitle>Recent players</CardTitle></div>
                    <Link className="text-link" to="/players">See all <ArrowUpRightIcon
                        size={16}/></Link></CardHeader><CardContent>{query.data.recent_players.length === 0 ?
                    <div className="empty-inline"><UsersThreeIcon size={25}/><p>No players yet.</p><Link
                        className="page-action-link page-action-link-small" to="/players/new"><PlusIcon size={16}/>Add the
                        first</Link></div> :
                    <div className="player-list">{query.data.recent_players.map((player) => <Link
                        to={`/players/${player.id}`} className="player-row" key={player.id}><Avatar
                        imageUrl={player.photo_url}>{initials(player.first_name, player.last_name)}</Avatar>
                        <div className="player-row-main">
                            <strong>{player.preferred_name || `${player.first_name} ${player.last_name}`}</strong><span>{player.primary_role}</span>
                        </div>
                        <StatusBadge status={player.status}/><ArrowUpRightIcon size={16}
                                                                           className="row-arrow"/></Link>)}</div>}</CardContent></Card><Card
                    className="focus-card"><CardHeader><p className="eyebrow">Next step</p><CardTitle>Build the team
                    profile</CardTitle></CardHeader><CardContent><p className="card-copy">Add roles, measurements, and
                    availability. The data foundation is ready for assessments and goals.</p>
                    <div className="progress-line"><span
                        style={{width: `${Math.min(query.data.total_players * 10, 100)}%`}}/></div>
                    <div className="progress-meta">
                        <span>Roster setup</span><strong>{Math.min(query.data.total_players * 10, 100)}%</strong></div>
                    <Link to="/players" className="button-link">Open player management <ArrowUpRightIcon size={16}/></Link></CardContent></Card>
                </div>
            </>}
        </WorkspaceState>
    );
}

function StatCard({label, value, helper, icon, tone = "default"}: {
    label: string;
    value: string | number;
    helper: string;
    icon: ReactNode;
    tone?: string
}) {
    return <Card className={`stat-card stat-${tone}`}>
        <div className="stat-icon">{icon}</div>
        <p>{label}</p><strong>{value}</strong><span>{helper}</span></Card>;
}

export function StatusBadge({status}: { status: string }) {
    const labels: Record<string, [string, "success" | "warning" | "danger" | "neutral"]> = {
        active: ["Active", "success"],
        injured: ["Injured", "warning"],
        inactive: ["Inactive", "neutral"]
    };
    const [label, tone] = labels[status] ?? [status, "neutral"];
    return <Badge tone={tone}>{label}</Badge>;
}
