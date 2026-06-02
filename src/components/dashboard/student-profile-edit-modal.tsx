"use client";

import { useEffect, useState } from "react";

import Modal from "@/components/ui/modal";
import { ProfileAiNotice, ProfileFieldInput } from "@/components/profile/profile-field";
import { ApiError } from "@/lib/api";
import { useSaveProfileMutation } from "@/hooks/queries";
import { STUDENT_PROFILE_FIELDS } from "@/lib/profile-fields";

export type StudentProfileData = {
  headline: string;
  skills: string;
  goals: string;
  background: string;
  user?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initial: StudentProfileData | null;
  onSaved: (profile: StudentProfileData & { user: number }) => void;
};

export default function StudentProfileEditModal({ open, onClose, initial, onSaved }: Props) {
  const saveProfile = useSaveProfileMutation();
  const isCreate = !initial;
  const [form, setForm] = useState({ headline: "", skills: "", goals: "", background: "" });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
      return;
    }
    setForm({
      headline: initial?.headline ?? "",
      skills: initial?.skills ?? "",
      goals: initial?.goals ?? "",
      background: initial?.background ?? "",
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
      })) as StudentProfileData & { user: number };
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
      description="Used for mentor matching, your journey, and story recommendations."
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
            form="student-profile-form"
            disabled={submitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Saving…" : isCreate ? "Create profile" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="student-profile-form" onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
        <ProfileAiNotice />
        {STUDENT_PROFILE_FIELDS.map((field) => (
          <ProfileFieldInput
            key={field.id}
            field={field}
            value={form[field.id as keyof typeof form]}
            onChange={(v) => setForm((f) => ({ ...f, [field.id]: v }))}
            disabled={submitting}
            idPrefix="s-"
          />
        ))}
        {submitError ? (
          <p className="text-sm text-red-500" role="alert">
            {submitError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
