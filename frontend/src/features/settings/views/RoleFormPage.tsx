import { ArrowLeft } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { RoleForm } from "../components/RoleForm";
import { api } from "../../../shared/lib/api";
import { PageHeader } from "../../../shared/components/layout/AppShell";
import { Card } from "../../../shared/components/ui/card";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";
import type { RoleType } from "../../../shared/types";

function getRoleType(search: string): RoleType {
  return new URLSearchParams(search).get("type") === "zone_defense" ? "zone_defense" : "primary";
}

export function RoleFormPage() {
  const { roleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTeam } = useWorkspace();
  const queryClient = useQueryClient();
  const editing = Boolean(roleId);
  const roleType = getRoleType(location.search);
  const query = useQuery({ queryKey: ["roles", selectedTeam?.id], queryFn: () => api.roles(selectedTeam!.id), enabled: Boolean(selectedTeam && roleId) });
  const role = query.data?.find((item) => item.id === roleId);
  const mutation = useMutation({ mutationFn: (input: Parameters<typeof api.createRole>[1]) => editing ? api.updateRole(selectedTeam!.id, roleId!, input) : api.createRole(selectedTeam!.id, input), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["roles", selectedTeam?.id] }); navigate("/settings"); } });
  const resolvedType = role?.role_type ?? roleType;

  return <WorkspaceState><div className="detail-top"><Link className="back-link" to="/settings"><ArrowLeft size={16} />Back to settings</Link></div>{editing && query.isLoading ? <div className="content-loading"><div className="loading-orb" /><p>Loading role…</p></div> : editing && (!role || query.error) ? <Card className="state-card"><h2>Role unavailable</h2><p>{(query.error as Error)?.message ?? "The role could not be found."}</p><Link className="page-action-link" to="/settings">Back to settings</Link></Card> : <><PageHeader eyebrow={editing ? "Settings / edit role" : "Settings / new role"} title={editing ? "Edit role" : "Add role"} description="Keep the role options available to coaches consistent across the team." /><RoleForm role={role} roleType={resolvedType} onCancel={() => navigate("/settings")} onSubmit={async (input) => { await mutation.mutateAsync(input); }} />{mutation.error && <p className="field-error form-submit-error">{(mutation.error as Error).message}</p>}</>}</WorkspaceState>;
}
