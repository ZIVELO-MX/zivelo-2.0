"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  SECTION_KEYS,
  type SectionKey,
  type SectionVisibility,
} from "@/lib/site-sections";
import {
  updateSiteSections,
} from "@/lib/actions/site-sections";

type SectionSettingsFormProps = {
  initialSections: SectionVisibility;
  labels: Record<SectionKey, { title: string; description: string }>;
  copy: {
    title: string;
    description: string;
    save: string;
    saving: string;
    cancel: string;
    saved: string;
  };
};

export function SectionSettingsForm({
  initialSections,
  labels,
  copy,
}: SectionSettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [savedSections, setSavedSections] = useState(initialSections);
  const [sections, setSections] = useState(initialSections);
  const [hasSaved, setHasSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isDirty = SECTION_KEYS.some((key) => sections[key] !== savedSections[key]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateSiteSections({ success: true, sections }, formData);
      if (result.success) {
        setSavedSections(result.sections);
        setSections(result.sections);
        setHasSaved(true);
        setMessage(null);
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="admin-settings-card">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              {SECTION_KEYS.map((key) => (
                <FieldLabel key={key} htmlFor={`section-${key}`}>
                  <Field orientation="horizontal" className="admin-section-setting">
                    <FieldContent>
                      <FieldTitle>{labels[key].title}</FieldTitle>
                      <FieldDescription>{labels[key].description}</FieldDescription>
                    </FieldContent>
                    <Switch
                      id={`section-${key}`}
                      name={key}
                      value="true"
                      uncheckedValue="false"
                      checked={sections[key]}
                      disabled={pending}
                      onCheckedChange={(checked) =>
                        setSections((current) => ({ ...current, [key]: checked }))
                      }
                    />
                  </Field>
                </FieldLabel>
              ))}
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="admin-settings-card__footer">
          <div className="admin-settings-card__feedback" aria-live="polite">
            {!message && !isDirty && hasSaved ? copy.saved : null}
            {message}
          </div>
          <div className="admin-settings-card__actions">
            <button
              className="btn btn--primary"
              type="submit"
              disabled={pending || !isDirty}
            >
              {pending ? copy.saving : copy.save}
            </button>
            <button
              className="btn btn--secondary"
              type="button"
              disabled={pending || !isDirty}
              onClick={() => setSections(savedSections)}
            >
              {copy.cancel}
            </button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
