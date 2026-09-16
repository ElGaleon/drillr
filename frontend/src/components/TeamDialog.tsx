import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useWorkspace } from "../workspace/WorkspaceContext";

const schema = z.object({ name: z.string().trim().min(2, "Inserisci un nome valido"), season: z.string().trim().min(4, "Inserisci la stagione") });
type FormValues = z.infer<typeof schema>;

export function TeamDialog() {
  const { createTeamOpen, setCreateTeamOpen, createTeam } = useWorkspace();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", season: "2025/26" } });
  const submit = form.handleSubmit(async (values) => { await createTeam({ ...values, accent: "orange" }); form.reset({ name: "", season: "2025/26" }); });
  return <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}><DialogContent><DialogHeader><DialogTitle>Nuovo team</DialogTitle><DialogDescription>Crea uno spazio separato per una squadra o una stagione diversa.</DialogDescription></DialogHeader><form className="form-stack" onSubmit={submit}><div><Label htmlFor="team-name">Nome team</Label><Input id="team-name" placeholder="es. Under 19" {...form.register("name")} />{form.formState.errors.name && <p className="field-error">{form.formState.errors.name.message}</p>}</div><div><Label htmlFor="team-season">Stagione</Label><Input id="team-season" placeholder="2025/26" {...form.register("season")} />{form.formState.errors.season && <p className="field-error">{form.formState.errors.season.message}</p>}</div><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => setCreateTeamOpen(false)}>Annulla</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Creazione…" : "Crea team"}</Button></div></form></DialogContent></Dialog>;
}
