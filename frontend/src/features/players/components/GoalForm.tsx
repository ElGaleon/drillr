import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Skill } from "../../../shared/types";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";

const schema = z.object({ title: z.string().min(1, "Add a clear objective").max(160), skill_id: z.string(), target_score: z.coerce.number().min(1).max(10).refine((value) => Number.isInteger(value * 2), "Use 0.5 increments"), due_date: z.string().optional() });
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

export function GoalForm({ skills, onSubmit }: { skills: Skill[]; onSubmit: (input: { title: string; skill_id: string | null; target_score: number; due_date: string | null }) => Promise<void> }) {
  const form = useForm<FormInput, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { title: "", skill_id: "overall", target_score: 7, due_date: "" } });
  const submit = form.handleSubmit(async (values) => onSubmit({ ...values, skill_id: values.skill_id === "overall" ? null : values.skill_id, due_date: values.due_date || null }));
  return <form className="form-stack" onSubmit={submit}><div><Label htmlFor="goal-title">Objective</Label><Input id="goal-title" placeholder="e.g. Raise defensive reading" {...form.register("title")} />{form.formState.errors.title && <p className="field-error">{form.formState.errors.title.message}</p>}</div><div className="form-grid"><div><Label htmlFor="goal-skill">Focus</Label><Select value={form.watch("skill_id")} onValueChange={(value) => form.setValue("skill_id", value, { shouldValidate: true })}><SelectTrigger id="goal-skill" className="field-select-box"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="overall">Overall average</SelectItem>{skills.filter((skill) => skill.is_active).map((skill) => <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>)}</SelectContent></Select></div><div><Label htmlFor="goal-target">Target score</Label><Select value={String(form.watch("target_score"))} onValueChange={(value) => form.setValue("target_score", Number(value), { shouldValidate: true })}><SelectTrigger id="goal-target" className="field-select-box"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 19 }, (_, index) => (index + 2) / 2).map((score) => <SelectItem key={score} value={String(score)}>{score.toFixed(1)} / 10</SelectItem>)}</SelectContent></Select></div></div><div><Label htmlFor="goal-due-date">Due date <span className="label-optional">Optional</span></Label><Input id="goal-due-date" type="date" {...form.register("due_date")} /></div><div className="form-actions"><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Add objective"}</Button></div></form>;
}
