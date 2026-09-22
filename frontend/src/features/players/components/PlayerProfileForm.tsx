import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, type ReactNode } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { z } from "zod";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import type { Player, PlayerInput, RoleDefinition, RoleType } from "../../../shared/types";

const schema = z.object({
  first_name: z.string().trim().min(1, "Enter a first name"),
  last_name: z.string().trim().min(1, "Enter a last name"),
  preferred_name: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  photo_url: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
  birth_date: z.string().optional(),
  gender: z.union([z.literal(""), z.enum(["female", "male", "non_binary", "other", "prefer_not_to_say"])]),
  dominant_hand: z.union([z.literal(""), z.enum(["left", "right", "ambidextrous", "unknown"])]),
  primary_role: z.string().trim().min(1, "Enter a primary role"),
  secondary_role: z.string().trim().optional(),
  jersey_number: z.preprocess((value) => value === "" ? undefined : Number(value), z.number().int().min(0).max(99).optional()),
  height_cm: z.preprocess((value) => value === "" ? undefined : Number(value), z.number().int().min(100).max(250).optional()),
  weight_kg: z.preprocess((value) => value === "" ? undefined : Number(value), z.number().min(20).max(250).optional()),
  status: z.enum(["active", "injured", "inactive"]),
  availability: z.union([z.literal(""), z.enum(["available", "limited", "unavailable"])]),
  medical_notes: z.string().max(2000, "Maximum 2000 characters").optional(),
  notes: z.string().max(2000, "Maximum 2000 characters").optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const emptyValues: FormValues = {
  first_name: "",
  last_name: "",
  preferred_name: "",
  nationality: "",
  email: "",
  phone: "",
  photo_url: "",
  birth_date: "",
  gender: "",
  dominant_hand: "",
  primary_role: "Handler",
  secondary_role: "",
  jersey_number: undefined,
  height_cm: undefined,
  weight_kg: undefined,
  status: "active",
  availability: "",
  medical_notes: "",
  notes: "",
};

function valuesFromPlayer(player?: Player): FormValues {
  if (!player) return emptyValues;
  return {
    first_name: player.first_name,
    last_name: player.last_name,
    preferred_name: player.preferred_name ?? "",
    nationality: player.nationality ?? "",
    email: player.email ?? "",
    phone: player.phone ?? "",
    photo_url: player.photo_url ?? "",
    birth_date: player.birth_date ?? "",
    gender: player.gender ?? "",
    dominant_hand: player.dominant_hand ?? "",
    primary_role: player.primary_role,
    secondary_role: player.secondary_role ?? "",
    jersey_number: player.jersey_number ?? undefined,
    height_cm: player.height_cm ?? undefined,
    weight_kg: player.weight_kg ?? undefined,
    status: player.status,
    availability: player.availability ?? "",
    medical_notes: player.medical_notes ?? "",
    notes: player.notes ?? "",
  };
}

function optionalText(value: string | undefined) {
  return value?.trim() || null;
}

const fallbackRoles: Record<RoleType, string[]> = { primary: ["Handler", "Middle", "Deep"], zone_defense: ["Nocciolina", "Cacciavite", "Trapano", "Seconda", "Ultimo"] };

function roleOptions(roles: RoleDefinition[] | undefined, roleType: RoleType, currentValue?: string) {
  const configured = roles?.filter((role) => role.role_type === roleType && role.is_active).map((role) => role.name) ?? [];
  const names = configured.length ? configured : fallbackRoles[roleType];
  if (currentValue && !names.includes(currentValue)) return [currentValue, ...names];
  return names;
}

export function PlayerProfileForm({ player, roles, onSubmit, onCancel }: { player?: Player; roles?: RoleDefinition[]; onSubmit: (input: PlayerInput) => Promise<void>; onCancel: () => void }) {
  const form = useForm<FormValues, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: emptyValues });
  useEffect(() => { form.reset(valuesFromPlayer(player)); }, [player, form]);
  const primaryRoleOptions = roleOptions(roles, "primary", player?.primary_role);
  const zoneDefenseRoleOptions = roleOptions(roles, "zone_defense", player?.secondary_role ?? undefined);
  useEffect(() => {
    if (!player && roles) {
      const configuredPrimaryRoles = roleOptions(roles, "primary");
      if (!configuredPrimaryRoles.includes(form.getValues("primary_role"))) form.setValue("primary_role", configuredPrimaryRoles[0]);
    }
  }, [form, player, roles]);

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      first_name: values.first_name,
      last_name: values.last_name,
      preferred_name: optionalText(values.preferred_name),
      nationality: optionalText(values.nationality),
      email: optionalText(values.email),
      phone: optionalText(values.phone),
      photo_url: optionalText(values.photo_url),
      birth_date: values.birth_date || undefined,
      gender: values.gender || null,
      dominant_hand: values.dominant_hand || null,
      primary_role: values.primary_role,
      secondary_role: optionalText(values.secondary_role),
      jersey_number: values.jersey_number ?? null,
      height_cm: values.height_cm ?? null,
      weight_kg: values.weight_kg ?? null,
      status: values.status,
      availability: values.availability || null,
      medical_notes: optionalText(values.medical_notes),
      notes: optionalText(values.notes),
    });
  });

  return (
    <form className="profile-form" onSubmit={submit}>
      <Card>
        <CardHeader><p className="eyebrow">Personal information</p><CardTitle>Identity</CardTitle></CardHeader>
        <CardContent className="form-stack">
          <div className="form-grid">
            <Field id="first-name" label="First name" error={form.formState.errors.first_name?.message}><Input id="first-name" autoFocus {...form.register("first_name")} /></Field>
            <Field id="last-name" label="Last name" error={form.formState.errors.last_name?.message}><Input id="last-name" {...form.register("last_name")} /></Field>
          </div>
          <div className="form-grid">
            <Field id="preferred-name" label="Preferred name" hint="Optional"><Input id="preferred-name" {...form.register("preferred_name")} /></Field>
            <Field id="birth-date" label="Date of birth" hint="Optional"><Input id="birth-date" type="date" {...form.register("birth_date")} /></Field>
          </div>
          <div className="form-grid">
            <Field id="nationality" label="Nationality" hint="Optional"><Input id="nationality" {...form.register("nationality")} /></Field>
            <Field id="photo-url" label="Profile photo URL" hint="Optional" error={form.formState.errors.photo_url?.message}><Input id="photo-url" type="url" placeholder="https://…" {...form.register("photo_url")} /></Field>
          </div>
          <div className="form-grid">
            <Field id="email" label="Email" hint="Optional" error={form.formState.errors.email?.message}><Input id="email" type="email" {...form.register("email")} /></Field>
            <Field id="phone" label="Phone" hint="Optional"><Input id="phone" type="tel" {...form.register("phone")} /></Field>
          </div>
          <div className="form-grid">
            <SelectField control={form.control} id="gender" name="gender" label="Gender" hint="Optional" options={[{ value: "", label: "Not specified" }, { value: "female", label: "Female" }, { value: "male", label: "Male" }, { value: "non_binary", label: "Non-binary" }, { value: "other", label: "Other" }, { value: "prefer_not_to_say", label: "Prefer not to say" }]} />
            <SelectField control={form.control} id="dominant-hand" name="dominant_hand" label="Dominant hand" hint="Optional" options={[{ value: "", label: "Not specified" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }, { value: "ambidextrous", label: "Ambidextrous" }, { value: "unknown", label: "Unknown" }]} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><p className="eyebrow">Sport profile</p><CardTitle>Team context</CardTitle></CardHeader>
        <CardContent className="form-stack">
          <div className="form-grid">
            <SelectField control={form.control} id="primary-role" name="primary_role" label="Primary role" options={primaryRoleOptions.map((value) => ({ value, label: value }))} />
            <SelectField control={form.control} id="secondary-role" name="secondary_role" label="Zone defense role" hint="Optional" options={[{ value: "", label: "Not specified" }, ...zoneDefenseRoleOptions.map((value) => ({ value, label: value }))]} />
          </div>
          <div className="form-grid">
            <Field id="jersey-number" label="Jersey number" hint="Optional"><Input id="jersey-number" type="number" min="0" max="99" {...form.register("jersey_number")} /></Field>
            <SelectField control={form.control} id="status" name="status" label="Roster status" options={[{ value: "active", label: "Active" }, { value: "injured", label: "Injured" }, { value: "inactive", label: "Inactive" }]} />
          </div>
          <SelectField control={form.control} id="player-availability" name="availability" label="Training availability" hint="Optional" options={[{ value: "", label: "Not specified" }, { value: "available", label: "Available" }, { value: "limited", label: "Limited" }, { value: "unavailable", label: "Unavailable" }]} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><p className="eyebrow">Physical profile</p><CardTitle>Measurements</CardTitle></CardHeader>
        <CardContent className="form-stack">
          <div className="form-grid">
            <Field id="height-cm" label="Height" hint="Centimetres, optional" error={form.formState.errors.height_cm?.message}><Input id="height-cm" type="number" min="100" max="250" {...form.register("height_cm")} /></Field>
            <Field id="weight-kg" label="Weight" hint="Kilograms, optional" error={form.formState.errors.weight_kg?.message}><Input id="weight-kg" type="number" min="20" max="250" step="0.1" {...form.register("weight_kg")} /></Field>
          </div>
          <Field id="notes" label="Staff notes" hint="Optional" error={form.formState.errors.notes?.message}><Textarea id="notes" placeholder="Useful context for staff…" {...form.register("notes")} /></Field>
          <Field id="medical-notes" label="Medical and injury notes" hint="Optional; restrict access to authorized staff" error={form.formState.errors.medical_notes?.message}><Textarea id="medical-notes" placeholder="Relevant injury or medical context…" {...form.register("medical_notes")} /></Field>
        </CardContent>
      </Card>
      <div className="form-actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" variant="accent" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Saving…" : player ? "Save profile" : "Create player"}</Button></div>
    </form>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return <div className="field-wrap"><Label htmlFor={id}>{label}</Label><span className={"field-hint" + (hint ? "" : " field-hint-placeholder")} aria-hidden={!hint}>{hint || "\u00a0"}</span><div className="field-control">{children}</div>{error && <p className="field-error">{error}</p>}</div>;
}

function SelectField({ control, id, name, label, hint, options }: { control: Control<FormValues, unknown, FormOutput>; id: string; name: "gender" | "dominant_hand" | "status" | "availability" | "primary_role" | "secondary_role"; label: string; hint?: string; options: Array<{ value: string; label: string }> }) {
  const emptyValue = "__empty__";
  return <div className="field-wrap"><Label htmlFor={id}>{label}</Label><span className={"field-hint" + (hint ? "" : " field-hint-placeholder")} aria-hidden={!hint}>{hint || "\u00a0"}</span><Controller control={control} name={name} render={({ field }) => <Select value={field.value || emptyValue} onValueChange={(value) => field.onChange(value === emptyValue ? "" : value)}><SelectTrigger id={id} className="field-select-box"><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value || emptyValue} value={option.value || emptyValue}>{option.label}</SelectItem>)}</SelectContent></Select>} /></div>;
}
