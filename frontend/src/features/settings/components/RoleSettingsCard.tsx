import { Archive, PencilSimple, Plus } from "@phosphor-icons/react";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import type { RoleDefinition, RoleType } from "../../../shared/types";
import { Link } from "react-router-dom";

const labels: Record<RoleType, { eyebrow: string; title: string; description: string }> = {
  primary: { eyebrow: "Primary roles", title: "Handler, middle, deep", description: "Define the roles used for a player's main offensive identity." },
  zone_defense: { eyebrow: "Zone defense roles", title: "Defensive assignment", description: "Configure the secondary role used when a player defends in zone." },
};

export function RoleSettingsCard({ roleType, roles, onArchive, isArchiving }: { roleType: RoleType; roles: RoleDefinition[]; onArchive: (role: RoleDefinition) => void; isArchiving: boolean }) {
  const copy = labels[roleType];
  return <Card className="settings-wide role-settings-card"><CardHeader><div className="card-heading-row"><div><p className="eyebrow">{copy.eyebrow}</p><CardTitle>{copy.title}</CardTitle></div><Link className="page-action-link page-action-link-small" to={`/settings/roles/new?type=${roleType}`}><Plus size={17} />Add role</Link></div></CardHeader><CardContent><p className="card-copy">{copy.description}</p><div className="skill-settings-list">{roles.map((role) => <div className={"skill-setting-row" + (role.is_active ? "" : " archived")} key={role.id}><div><strong>{role.name}</strong><span>{role.is_active ? `Order ${role.sort_order}` : "Archived"}</span></div><div className="skill-setting-actions">{!role.is_active && <span className="preference-pill">Archived</span>}<Link aria-label={`Edit ${role.name}`} className="icon-link" to={`/settings/roles/${role.id}/edit`}><PencilSimple size={17} /></Link>{role.is_active && <Button aria-label={`Archive ${role.name}`} variant="ghost" size="icon" disabled={isArchiving} onClick={() => onArchive(role)}><Archive size={17} /></Button>}</div></div>)}</div></CardContent></Card>;
}
