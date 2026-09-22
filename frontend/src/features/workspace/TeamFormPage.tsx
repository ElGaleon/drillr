import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/components/ui/card";
import { Input } from "../../shared/components/ui/input";
import { Label } from "../../shared/components/ui/label";
import { PageHeader } from "../../shared/components/layout/AppShell";
import { useWorkspace } from "./WorkspaceContext";

const schema = z.object({ name: z.string().trim().min(2, "Enter a valid team name"), season: z.string().trim().min(4, "Enter a season") });
type FormValues = z.infer<typeof schema>;

export function TeamFormPage() {
  const navigate = useNavigate();
  const { createTeam } = useWorkspace();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", season: "2025/26" } });
  const submit = form.handleSubmit(async (values) => { await createTeam({ ...values, accent: "orange" }); });

  return <><div className="detail-top"><Link className="back-link" to="/dashboard"><ArrowLeft size={16} />Back to dashboard</Link></div><PageHeader eyebrow="Workspace / new team" title="Create a team" description="Create a separate space for another team or season." /><Card className="profile-form"><CardHeader><p className="eyebrow">Team details</p><CardTitle>Team identity</CardTitle></CardHeader><CardContent><form className="form-stack" onSubmit={submit}><div><Label htmlFor="team-name">Team name</Label><Input id="team-name" autoFocus placeholder="e.g. Under 19" {...form.register("name")} />{form.formState.errors.name && <p className="field-error">{form.formState.errors.name.message}</p>}</div><div><Label htmlFor="team-season">Season</Label><Input id="team-season" placeholder="2025/26" {...form.register("season")} />{form.formState.errors.season && <p className="field-error">{form.formState.errors.season.message}</p>}</div><div className="form-actions"><Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>Cancel</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creating…" : "Create team"}</Button></div></form></CardContent></Card></>;
}
