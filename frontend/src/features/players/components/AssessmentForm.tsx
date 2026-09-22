import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/button";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import type { AssessmentSource, Skill } from "../../../shared/types";

const schema = z.object({ source: z.enum(["assessment", "review"]), note: z.string().max(2000, "Maximum 2000 characters").optional(), ratings: z.record(z.string(), z.coerce.number().min(1).max(10).refine((value) => Number.isInteger(value * 2), "Use 0.5 increments") ) });
type FormValues = z.output<typeof schema>;

export function AssessmentForm({ skills, onSubmit }: { skills: Skill[]; onSubmit: (input: { source: AssessmentSource; note?: string; ratings: Array<{ skill_id: string; score: number }> }) => Promise<void> }) {
  const form = useForm<z.input<typeof schema>, unknown, FormValues>({ resolver: zodResolver(schema), defaultValues: { source: "assessment", note: "", ratings: Object.fromEntries(skills.map((skill) => [skill.id, 5])) } });
  const submit = form.handleSubmit(async (values) => { await onSubmit({ source: values.source, note: values.note || undefined, ratings: skills.filter((skill) => skill.is_active).map((skill) => ({ skill_id: skill.id, score: values.ratings[skill.id] })) }); });

  return <form className="form-stack" onSubmit={submit}><div><Label htmlFor="assessment-source">Record type</Label><Controller control={form.control} name="source" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="assessment-source" className="field-select-box"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="assessment">Assessment</SelectItem><SelectItem value="review">Review</SelectItem></SelectContent></Select>} /></div><div className="assessment-grid">{skills.filter((skill) => skill.is_active).map((skill) => <div className="assessment-row" key={skill.id}><Label htmlFor={`score-${skill.id}`}>{skill.name}</Label><Controller control={form.control} name={`ratings.${skill.id}`} render={({ field }) => <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}><SelectTrigger id={`score-${skill.id}`} className="field-select-box score-select"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 19 }, (_, index) => (index + 2) / 2).map((score) => <SelectItem key={score} value={String(score)}>{score.toFixed(1)} / 10</SelectItem>)}</SelectContent></Select>} /></div>)}</div><div><Label htmlFor="assessment-note">Note</Label><Textarea id="assessment-note" placeholder="Add context for this review…" {...form.register("note")} />{form.formState.errors.note && <p className="field-error">{form.formState.errors.note.message}</p>}</div><div className="form-actions"><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save review"}</Button></div></form>;
}
