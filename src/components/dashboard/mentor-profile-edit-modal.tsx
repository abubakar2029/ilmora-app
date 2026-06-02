"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/modal";
import { ProfileAiNotice, ProfileFieldInput } from "@/components/profile/profile-field";
import { ApiError } from "@/lib/api";
import { useSaveProfileMutation } from "@/hooks/queries";
import { MENTOR_PROFILE_FORM_FIELDS, MENTOR_SOCIAL_FIELDS } from "@/lib/profile-fields";

export type MentorProfileData = {
  headline: string;
  expertise: string;
  contact_email?: string;
  linkedin_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  user?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial: MentorProfileData | null;
  onSaved: (profile: MentorProfileData & { user: number }) => void;
};

export default function MentorProfileEditModal({ open, onClose, initial, onSaved }: Props) {
  const saveProfile = useSaveProfileMutation();
  const isCreate = !initial;
  const [form, setForm] = useState({
    headline: "",
    expertise: "",
    contact_email: "",
    linkedin_url: "",
    instagram_url: "",
    facebook_url: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      return;
    }
    setForm({
      headline: initial?.headline ?? "",
      expertise: initial?.expertise ?? "",
      contact_email: initial?.contact_email ?? "",
      linkedin_url: initial?.linkedin_url ?? "",
      instagram_url: initial?.instagram_url ?? "",
      facebook_url: initial?.facebook_url ?? "",
    });
    setSubmitError(null);
    setSubmitting(false);
  }, [open, initial]);

  async function parseApiError(e: unknown): Promise<string> {
    if (e instanceof ApiError) {
      const b = e.body as Record<string, unknown>;
      if (typeof b.detail === "string") return b.detail;
      const k = Object.keys(b)[0];
      const v = k ? b[k] : null;
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
    }
    if (e instanceof Error) return e.message;
    return "Something went wrong";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const saved = (await saveProfile.mutateAsync({
        body: form,
        create: isCreate,
      })) as MentorProfileData & { user: number };
      setSubmitting(false);
      onSaved(saved);
      onClose();
    } catch (err) {
      setSubmitError(await parseApiError(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isCreate ? "Set up your profile" : "Edit profile"}
      description="Headline and expertise power matching. Social links are optional and shown on your public profile."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="mentor-profile-form"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : isCreate ? "Create profile" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="mentor-profile-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <ProfileAiNotice />
        {MENTOR_PROFILE_FORM_FIELDS.map((field) => (
          <ProfileFieldInput
            key={field.id}
            field={field}
            value={form[field.id as keyof typeof form]}
            onChange={(v) => setForm((f) => ({ ...f, [field.id]: v }))}
            disabled={submitting}
            idPrefix="m-"
          />
        ))}
        <div className="border-t border-border/60 pt-4">
          <p className="text-sm font-semibold text-foreground">Social & contact (optional)</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown with icons on your public mentor page and dashboard preview.
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {MENTOR_SOCIAL_FIELDS.map((field) => (
              <ProfileFieldInput
                key={field.id}
                field={field}
                value={form[field.id as keyof typeof form]}
                onChange={(v) => setForm((f) => ({ ...f, [field.id]: v }))}
                disabled={submitting}
                idPrefix="m-social-"
              />
            ))}
          </div>
        </div>
        {submitError ? (
          <p className="text-sm text-red-500" role="alert">
            {submitError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
