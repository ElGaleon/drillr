import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import type { RoleDefinition, RoleInput, RoleType } from "../../../shared/types";

const schema = z.object({ name: z.string().trim().min(1, "Role name is required"), sort_order: z.coerce.number().int().min(0).max(999) });
type FormValues = z.output<typeof schema>;

export function RoleForm({ role, roleType, onSubmit, onCancel }: { role?: RoleDefinition; roleType: RoleType; onSubmit: (input: RoleInput) => Promise<void>; onCancel: () => void }) {
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", sort_order: 0 } });
  useEffect(() => { form.reset(role ? { name: role.name, sort_order: role.sort_order } : { name: "", sort_order: 0 }); }, [role, form]);
  const submit = form.handleSubmit(async (values) => { await onSubmit({ ...values, role_type: role?.role_type ?? roleType }); });
  const label = roleType === "primary" ? "Primary role" : "Zone defense role";

  return <Card className="profile-form"><CardHeader><p className="eyebrow">Role configuration</p><CardTitle>{role ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}</CardTitle></CardHeader><CardContent><form className="form-stack" onSubmit={submit}><div><Label htmlFor="role-name">Name</Label><Input id="role-name" autoFocus {...form.register("name")} />{form.formState.errors.name && <p className="field-error">{form.formState.errors.name.message}</p>}</div><div><Label htmlFor="role-order">Order</Label><Input id="role-order" type="number" min="0" {...form.register("sort_order")} />{form.formState.errors.sort_order && <p className="field-error">{form.formState.errors.sort_order.message}</p>}</div><div className="form-actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save role"}</Button></div></form></CardContent></Card>;
}
