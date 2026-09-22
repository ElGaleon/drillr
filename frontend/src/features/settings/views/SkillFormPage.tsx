import { ArrowLeft } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { SkillForm } from "../components/SkillForm";
import { api } from "../../../shared/lib/api";
import { PageHeader } from "../../../shared/components/layout/AppShell";
import { Card } from "../../../shared/components/ui/card";
import { useWorkspace } from "../../workspace/WorkspaceContext";
import { WorkspaceState } from "../../workspace/WorkspaceState";

export function SkillFormPage() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { selectedTeam } = useWorkspace();
  const editing = Boolean(skillId);
  const query = useQuery({ queryKey: ["skills", selectedTeam?.id], queryFn: () => api.skills(selectedTeam!.id), enabled: Boolean(selectedTeam && skillId) });
  const skill = query.data?.find((item) => item.id === skillId);
  const mutation = useMutation({ mutationFn: (input: Parameters<typeof api.createSkill>[1]) => editing ? api.updateSkill(selectedTeam!.id, skillId!, input) : api.createSkill(selectedTeam!.id, input), onSuccess: () => navigate("/settings") });

  return <WorkspaceState><div className="detail-top"><Link className="back-link" to="/settings"><ArrowLeft size={16} />Back to settings</Link></div>{editing && query.isLoading ? <div className="content-loading"><div className="loading-orb" /><p>Loading skill…</p></div> : editing && (!skill || query.error) ? <Card className="state-card"><h2>Skill unavailable</h2><p>{(query.error as Error)?.message ?? "The skill could not be found."}</p><Link className="page-action-link" to="/settings">Back to settings</Link></Card> : <><PageHeader eyebrow={editing ? "Settings / edit skill" : "Settings / new skill"} title={editing ? "Edit skill parameter" : "Add skill parameter"} description="Configure the framework coaches use for player assessments." /><SkillForm skill={skill} onCancel={() => navigate("/settings")} onSubmit={async (input) => { await mutation.mutateAsync(input); }} />{mutation.error && <p className="field-error form-submit-error">{(mutation.error as Error).message}</p>}</>}</WorkspaceState>;
}
