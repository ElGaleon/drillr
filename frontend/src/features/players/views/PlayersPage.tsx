import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, UserPlus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/lib/api";
import { initials } from "../../../shared/lib/utils";
import { Avatar } from "../../../shared/components/ui/avatar";
import { Card, CardContent } from "../../../shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { PageHeader } from "../../../shared/components/layout/AppShell";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";
import { StatusBadge } from "../../dashboard/views/DashboardPage";
import { FilterBar, FilterBarSelect } from "../../../shared/components/layout/FilterBar";

export function PlayersPage() {
  const { selectedTeam } = useWorkspace();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const query = useQuery({ queryKey: ["players", selectedTeam?.id, search, status], queryFn: () => api.players(selectedTeam!.id, search, status), enabled: Boolean(selectedTeam) });

  return (
    <WorkspaceState>
      <PageHeader eyebrow="Roster / management" title="Players" description={`${selectedTeam?.player_count ?? 0} profiles in ${selectedTeam?.name ?? "the team"}.`} actions={<Link className="page-action-link" to="/players/new"><Plus size={18} weight="bold" />New player</Link>} />
      <Card className="players-card">
        <CardContent className="players-card-content">
          <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by first or last name…" resultCount={query.data?.length ?? 0}><FilterBarSelect><Select value={status} onValueChange={setStatus}><SelectTrigger className="filter-select w-auto" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="injured">Injured</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></FilterBarSelect></FilterBar>
          {query.isLoading ? <div className="table-skeleton">{[1, 2, 3, 4].map((item) => <div className="skeleton-row" key={item} />)}</div> : query.error ? <div className="empty-state"><p>Players could not be loaded.</p><span>{(query.error as Error).message}</span></div> : query.data?.length ? <div className="players-table-wrap"><table className="players-table"><thead><tr><th>Player</th><th>Role</th><th>Status</th><th className="table-action-col" /></tr></thead><tbody>{query.data.map((player) => <tr key={player.id}><td><Link className="player-cell" to={`/players/${player.id}`}><Avatar imageUrl={player.photo_url}>{initials(player.first_name, player.last_name)}</Avatar><span><strong>{player.preferred_name || `${player.first_name} ${player.last_name}`}</strong><small>{player.first_name} {player.last_name}</small></span></Link></td><td><span className="role-text">{player.primary_role}</span></td><td><StatusBadge status={player.status} /></td><td className="table-action-col"><Link className="row-edit" to={`/players/${player.id}`}>Open</Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><UserPlus size={25} /></div><h2>Your roster is empty</h2><p>Add the first profile to start building team context.</p><Link className="page-action-link" to="/players/new"><Plus size={18} />Add player</Link></div>}
        </CardContent>
      </Card>
    </WorkspaceState>
  );
}
