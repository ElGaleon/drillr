import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Button} from "../../../shared/components/ui/button";
import {Input} from "../../../shared/components/ui/input";
import {Label} from "../../../shared/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../shared/components/ui/select";
import {Textarea} from "../../../shared/components/ui/textarea";

const schema = z.object({review_date: z.string().min(1, "Choose a date"), strengths: z.string().max(5000).optional(), next_steps: z.string().max(5000).optional(), development_path: z.string().max(5000).optional(), coach_notes: z.string().max(5000).optional(), visibility: z.enum(["staff", "player"]), status: z.enum(["draft", "published"]) });
type FormValues = z.output<typeof schema>;

export function ReviewForm({onSubmit}: {onSubmit: (input: FormValues) => Promise<void>}) {
    const form = useForm<z.input<typeof schema>, unknown, FormValues>({resolver: zodResolver(schema), defaultValues: {review_date: new Date().toISOString().slice(0, 10), strengths: "", next_steps: "", development_path: "", coach_notes: "", visibility: "staff", status: "draft"}});
    const submit = form.handleSubmit(async (values) => onSubmit(values));
    return <form className="form-stack" onSubmit={submit}>
        <div className="form-grid"><div><Label htmlFor="review-date">Review date</Label><Input id="review-date" type="date" {...form.register("review_date")}/>{form.formState.errors.review_date && <p className="field-error">{form.formState.errors.review_date.message}</p>}</div><div><Label htmlFor="review-status">Status</Label><Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as FormValues["status"])}><SelectTrigger id="review-status" className="field-select-box"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div></div>
        <div><Label htmlFor="review-strengths">Strengths</Label><Textarea id="review-strengths" placeholder="What is progressing well?" {...form.register("strengths")}/></div>
        <div><Label htmlFor="review-next-steps">Next steps</Label><Textarea id="review-next-steps" placeholder="What should the player focus on next?" {...form.register("next_steps")}/></div>
        <div><Label htmlFor="review-development-path">Development path</Label><Textarea id="review-development-path" placeholder="Define the next development phase." {...form.register("development_path")}/></div>
        <div><Label htmlFor="review-coach-notes">Coach notes</Label><Textarea id="review-coach-notes" placeholder="Internal context for the staff." {...form.register("coach_notes")}/></div>
        <div><Label htmlFor="review-visibility">Visibility</Label><Select value={form.watch("visibility")} onValueChange={(value) => form.setValue("visibility", value as FormValues["visibility"])}><SelectTrigger id="review-visibility" className="field-select-box"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="staff">Staff only</SelectItem><SelectItem value="player">Player visible</SelectItem></SelectContent></Select></div>
        <div className="form-actions"><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : "Save review"}</Button></div>
    </form>;
}
