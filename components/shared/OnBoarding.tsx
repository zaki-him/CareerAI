"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  Briefcase,
  CalendarBlank,
  Target,
  Clock,
  Sparkle,
  Lightbulb,
  RocketLaunch,
  CircleNotch,
} from "@phosphor-icons/react";
import { type UserProfile } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<keyof UserProfile, string>>;

// Required fields (optional ones are omitted from this set)
const REQUIRED_FIELDS: (keyof UserProfile)[] = [
  "name",
  "currentRole",
  "yearsExperience",
  "desiredRole",
  "timePerWeek",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validate(data: UserProfile): FormErrors {
  const errors: FormErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if (!data[field].trim()) {
      errors[field] = "This field is required.";
    }
  }

  if (
    data.yearsExperience &&
    !/^\d+(\.\d+)?$/.test(data.yearsExperience.trim())
  ) {
    errors.yearsExperience = "Please enter a valid number (e.g. 3).";
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

type FieldConfig = {
  id: keyof UserProfile;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  isTextarea?: boolean;
};

const FORM_FIELDS: FieldConfig[] = [
  { id: "name", label: "Name", icon: UserCircle, placeholder: "Alex" },
  { id: "currentRole", label: "Current role", icon: Briefcase, placeholder: "e.g. Support Engineer" },
  { id: "yearsExperience", label: "Years of experience", icon: CalendarBlank, placeholder: "e.g. 3", inputMode: "decimal" },
  { id: "desiredRole", label: "Target role / goal", icon: Target, placeholder: "e.g. Senior Frontend Engineer" },
  { id: "timePerWeek", label: "Time you can invest per week", icon: Clock, placeholder: "e.g. 5–8 hours" },
  { id: "constraints", label: "Constraints (optional)", icon: Sparkle, placeholder: "e.g. full-time job, family, budget" },
  { id: "challenges", label: "Biggest challenges (optional)", icon: Lightbulb, placeholder: "What tends to get in the way? Confidence, time, direction, something else?", isTextarea: true },
];

const INITIAL_FORM: UserProfile = {
  name: "",
  currentRole: "",
  yearsExperience: "",
  desiredRole: "",
  timePerWeek: "",
  constraints: "",
  challenges: "",
};

interface OnBoardingProps {
  /** Called with the validated profile when the user submits. */
  onSubmit?: (profile: UserProfile) => void | Promise<void>;
}

export default function OnBoarding({ onSubmit }: OnBoardingProps) {
  const [form, setForm] = useState<UserProfile>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Generic change handler — works for both <input> and <textarea>
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field on the next keystroke
    if (errors[name as keyof UserProfile]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Trim all string values before submission
    const profile: UserProfile = {
      name: form.name.trim(),
      currentRole: form.currentRole.trim(),
      yearsExperience: form.yearsExperience.trim(),
      desiredRole: form.desiredRole.trim(),
      timePerWeek: form.timePerWeek.trim(),
      constraints: form.constraints.trim(),
      challenges: form.challenges.trim(),
    };

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(profile);
      } else {
        // Default: log the prepared payload (replace with your server action / API call)
        console.log("[OnBoarding] Submitted profile:", profile);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto rounded-xl shadow-lg border border-border/60 flex flex-col h-full">
      {/* ── Header ── */}
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center size-9 rounded-lg bg-muted ring-1 ring-border">
            <Target weight="duotone" className="size-5 text-foreground" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold tracking-tight">
              Start with your career destination
            </CardTitle>
            <CardDescription className="mt-0.5">
              A few questions so we can shape a realistic, personalized 12‑month
              roadmap.
            </CardDescription>
          </div>
        </div>

        <CardAction>
          <Badge
            variant="outline"
            className="rounded-full px-3 py-0.5 text-[11px] font-medium"
          >
            <Sparkle weight="fill" className="size-3 mr-1" />
            Step 1
          </Badge>
        </CardAction>
      </CardHeader>

      {/* ── Form fields ── */}
      <CardContent className="flex-1">
        <form id="onboarding-form" className="grid grid-cols-1 sm:grid-cols-2 gap-5" onSubmit={handleSubmit} noValidate>
          {FORM_FIELDS.map((field) => {
            const Icon = field.icon;
            const error = errors[field.id];

            return (
              <div key={field.id} className={`space-y-1.5 ${field.isTextarea ? "sm:col-span-2" : ""}`}>
                <Label htmlFor={field.id} className="font-semibold">
                  <Icon weight="duotone" className="size-4" />
                  {field.label}
                </Label>
                {field.isTextarea ? (
                  <Textarea
                    id={field.id}
                    name={field.id}
                    value={form[field.id]}
                    onChange={handleChange}
                    rows={4}
                    placeholder={field.placeholder}
                    className="rounded-lg px-3 py-2.5 text-sm min-h-[100px]"
                    disabled={isLoading}
                  />
                ) : (
                  <Input
                    id={field.id}
                    name={field.id}
                    value={form[field.id]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    inputMode={field.inputMode}
                    className={`rounded-lg h-10 px-3 text-sm ${error ? "border-destructive" : ""}`}
                    disabled={isLoading}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${field.id}-error` : undefined}
                  />
                )}
                {error && (
                  <p id={`${field.id}-error`} className="text-xs text-destructive">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </form>
      </CardContent>

      {/* ── Footer ── */}
      <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-b-xl bg-muted/40">
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground leading-relaxed">
          <Lightbulb weight="fill" className="size-3.5 mt-0.5 shrink-0" />
          We&apos;ll use this to sketch a realistic, focused path. Adjust
          anytime with Zak.
        </p>

        <Button
          type="submit"
          form="onboarding-form"
          size="lg"
          disabled={isLoading}
          className="rounded-full px-5 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <CircleNotch className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <RocketLaunch weight="fill" className="size-4" />
              Generate my 12‑month plan
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
