import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import type { Skill, SkillInput } from "../../../shared/types";

const schema = z.object({ name: z.string().trim().min(1, "Skill name is required"), category: z.enum(["attack", "defense"]), description: z.string().max(500, "Maximum 500 characters").optional(), sort_order: z.coerce.number().int().min(0).max(999) });
type FormValues = z.output<typeof schema>;

export function SkillForm({ skill, onSubmit, onCancel }: { skill?: Skill; onSubmit: (input: SkillInput) => Promise<void>; onCancel: () => void }) {
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { name: "", category: "attack", description: "", sort_order: 0 } });
  useEffect(() => { form.reset(skill ? { name: skill.name, category: skill.category, description: skill.description ?? "", sort_order: skill.sort_order } : { name: "", category: "attack", description: "", sort_order: 0 }); }, [skill, form]);
  const submit = form.handleSubmit(async (values) => { await onSubmit({ ...values, description: values.description || null }); });

  return <Card className="profile-form"><CardHeader><p className="eyebrow">Skill framework</p><CardTitle>{skill ? "Edit skill parameter" : "Add skill parameter"}</CardTitle></CardHeader><CardContent><form className="form-stack" onSubmit={submit}><div><Label htmlFor="skill-name">Name</Label><Input id="skill-name" autoFocus {...form.register("name")} />{form.formState.errors.name && <p className="field-error">{form.formState.errors.name.message}</p>}</div><div className="form-grid"><div><Label htmlFor="skill-category">Category</Label><Controller control={form.control} name="category" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="skill-category" className="field-select-box"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="attack">Attack</SelectItem><SelectItem value="defense">Defense</SelectItem></SelectContent></Select>} /></div><div><Label htmlFor="skill-order">Order</Label><Input id="skill-order" type="number" min="0" {...form.register("sort_order")} /></div></div><div><Label htmlFor="skill-description">Description</Label><Textarea id="skill-description" placeholder="What does this parameter measure?" {...form.register("description")} />{form.formState.errors.description && <p className="field-error">{form.formState.errors.description.message}</p>}</div><div className="form-actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save skill"}</Button></div></form></CardContent></Card>;
}
