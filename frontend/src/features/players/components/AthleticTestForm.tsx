import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {Button} from "../../../shared/components/ui/button";
import {Input} from "../../../shared/components/ui/input";
import {Label} from "../../../shared/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../../../shared/components/ui/select";
import {Textarea} from "../../../shared/components/ui/textarea";
import type {AthleticTest} from "../../../shared/types";

const schema = z.object({test_id: z.string().min(1, "Choose a test"), value: z.coerce.number().finite().min(0, "Enter a non-negative value"), recorded_at: z.string().min(1, "Choose a date"), note: z.string().max(2000).optional()});
type FormValues = z.output<typeof schema>;

export function AthleticTestForm({tests, onSubmit}: {tests: AthleticTest[]; onSubmit: (input: FormValues) => Promise<void>}) {
    const form = useForm<z.input<typeof schema>, unknown, FormValues>({resolver: zodResolver(schema), defaultValues: {test_id: tests[0]?.id || "", value: 0, recorded_at: new Date().toISOString().slice(0, 10), note: ""}});
    const submit = form.handleSubmit(async (values) => onSubmit({...values, recorded_at: new Date(`${values.recorded_at}T12:00:00`).toISOString()}));
    return <form className="form-stack" onSubmit={submit}><div><Label htmlFor="athletic-test">Test</Label><Controller control={form.control} name="test_id" render={({field}) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="athletic-test" className="field-select-box"><SelectValue placeholder="Select a test"/></SelectTrigger><SelectContent>{tests.filter((test) => test.is_active).map((test) => <SelectItem key={test.id} value={test.id}>{test.name} · {test.unit}</SelectItem>)}</SelectContent></Select>}/>{form.formState.errors.test_id && <p className="field-error">{form.formState.errors.test_id.message}</p>}</div><div className="form-grid"><div><Label htmlFor="athletic-value">Value</Label><Input id="athletic-value" type="number" step="any" {...form.register("value")}/>{form.formState.errors.value && <p className="field-error">{form.formState.errors.value.message}</p>}</div><div><Label htmlFor="athletic-date">Date</Label><Input id="athletic-date" type="date" {...form.register("recorded_at")}/>{form.formState.errors.recorded_at && <p className="field-error">{form.formState.errors.recorded_at.message}</p>}</div></div><div><Label htmlFor="athletic-note">Note <span className="label-optional">Optional</span></Label><Textarea id="athletic-note" placeholder="Add context for this result." {...form.register("note")}/></div><div className="form-actions"><Button type="submit" variant="accent" disabled={form.formState.isSubmitting || !tests.length}>{form.formState.isSubmitting ? "Saving…" : "Save result"}</Button></div></form>;
}
