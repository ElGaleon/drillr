import { useEffect, useState } from "react";
import { FloppyDisk, Palette, ShieldCheck, SlidersHorizontal } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { PageHeader } from "../components/layout/AppShell";
import { WorkspaceState } from "../components/WorkspaceState";
import { useWorkspace } from "../workspace/WorkspaceContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import type { Team } from "../types";

export function SettingsPage() {
  const { selectedTeam } = useWorkspace();
  const queryClient = useQueryClient();
  const [name, setName] = useState(selectedTeam?.name ?? "");
  const [season, setSeason] = useState(selectedTeam?.season ?? "");
  useEffect(() => { setName(selectedTeam?.name ?? ""); setSeason(selectedTeam?.season ?? ""); }, [selectedTeam]);
  const saveMutation = useMutation({ mutationFn: () => api.updateTeam(selectedTeam!.id, { name, season }), onSuccess: (team) => queryClient.setQueryData<Team[]>(["teams"], (teams) => teams?.map((item) => item.id === team.id ? team : item)) });
  return <WorkspaceState><PageHeader eyebrow="Workspace / configurazione" title="Impostazioni" description="Gestisci il contesto della squadra e le preferenze di lavoro." /><div className="settings-grid"><Card><CardHeader><div className="settings-title"><div className="settings-icon"><SlidersHorizontal size={19} /></div><div><p className="eyebrow">Team attivo</p><CardTitle>Identità della squadra</CardTitle></div></div></CardHeader><CardContent><div className="form-stack"><div><Label htmlFor="settings-name">Nome team</Label><Input id="settings-name" value={name} onChange={(event) => setName(event.target.value)} /></div><div><Label htmlFor="settings-season">Stagione</Label><Input id="settings-season" value={season} onChange={(event) => setSeason(event.target.value)} /></div><Button variant="accent" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !name.trim() || !season.trim()}><FloppyDisk size={17} />{saveMutation.isPending ? "Salvataggio…" : "Salva modifiche"}</Button>{saveMutation.isSuccess && <p className="success-copy">Modifiche salvate.</p>}</div></CardContent></Card><Card><CardHeader><div className="settings-title"><div className="settings-icon green"><ShieldCheck size={19} /></div><div><p className="eyebrow">Account</p><CardTitle>Accesso e sicurezza</CardTitle></div></div></CardHeader><CardContent><div className="settings-list"><div><strong>Provider</strong><span>Clerk Authentication</span></div><div><strong>Modello accesso</strong><span>Un account, più team separati</span></div><div><strong>Autorizzazione</strong><span>API scoped per owner e team</span></div></div><p className="card-copy settings-note">La sessione viene verificata dall’API. Le impostazioni di password, MFA e sessioni restano gestite da Clerk.</p></CardContent></Card><Card className="settings-wide"><CardHeader><div className="settings-title"><div className="settings-icon orange"><Palette size={19} /></div><div><p className="eyebrow">Interfaccia</p><CardTitle>Preferenze visuali</CardTitle></div></div></CardHeader><CardContent><div className="preference-row"><div><strong>Sidebar</strong><span>Usa il controllo in alto per espandere o comprimere la navigazione. La scelta viene ricordata su questo dispositivo.</span></div><span className="preference-pill">Responsive</span></div><div className="preference-row"><div><strong>Stile</strong><span>Superficie chiara, tipografia editoriale e accento arancio per mantenere il focus sul lavoro dello staff.</span></div><span className="preference-pill">Drillr light</span></div></CardContent></Card></div></WorkspaceState>;
}
