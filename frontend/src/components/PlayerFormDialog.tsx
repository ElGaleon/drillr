import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import type { Player, PlayerInput } from "../types";

const schema = z.object({ first_name: z.string().trim().min(1, "Inserisci il nome"), last_name: z.string().trim().min(1, "Inserisci il cognome"), birth_date: z.string().optional(), primary_role: z.string().trim().min(1, "Inserisci il ruolo"), status: z.enum(["active", "injured", "inactive"]), notes: z.string().max(2000, "Massimo 2000 caratteri").optional() });
type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = { first_name: "", last_name: "", birth_date: "", primary_role: "Jolly", status: "active", notes: "" };

export function PlayerFormDialog({ open, onOpenChange, player, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; player?: Player; onSubmit: (input: PlayerInput) => Promise<void> }) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues });
  useEffect(() => { form.reset(player ? { first_name: player.first_name, last_name: player.last_name, birth_date: player.birth_date ?? "", primary_role: player.primary_role, status: player.status, notes: player.notes ?? "" } : emptyValues); }, [player, open]);
  const submit = form.handleSubmit(async (values) => { await onSubmit({ ...values, birth_date: values.birth_date || undefined, notes: values.notes || null }); onOpenChange(false); });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{player ? "Modifica giocatore" : "Nuovo giocatore"}</DialogTitle><DialogDescription>{player ? "Aggiorna il profilo operativo del giocatore." : "Aggiungi un profilo alla rosa del team selezionato."}</DialogDescription></DialogHeader><form className="form-stack" onSubmit={submit}><div className="form-grid"><div><Label htmlFor="first-name">Nome</Label><Input id="first-name" autoFocus {...form.register("first_name")} />{form.formState.errors.first_name && <p className="field-error">{form.formState.errors.first_name.message}</p>}</div><div><Label htmlFor="last-name">Cognome</Label><Input id="last-name" {...form.register("last_name")} />{form.formState.errors.last_name && <p className="field-error">{form.formState.errors.last_name.message}</p>}</div></div><div className="form-grid"><div><Label htmlFor="role">Ruolo primario</Label><Input id="role" placeholder="es. Ala" {...form.register("primary_role")} /></div><div><Label htmlFor="status">Stato</Label><select id="status" className="field-select" {...form.register("status")}><option value="active">Attivo</option><option value="injured">Infortunato</option><option value="inactive">Inattivo</option></select></div></div><div><Label htmlFor="birth-date">Data di nascita</Label><Input id="birth-date" type="date" {...form.register("birth_date")} /></div><div><Label htmlFor="notes">Note</Label><Textarea id="notes" placeholder="Annotazioni utili per lo staff…" {...form.register("notes")} />{form.formState.errors.notes && <p className="field-error">{form.formState.errors.notes.message}</p>}</div><div className="dialog-actions"><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Annulla</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Salvataggio…" : "Salva profilo"}</Button></div></form></DialogContent></Dialog>;
}
