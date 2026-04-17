"use client";

import { FormEvent, useMemo, useState } from "react";
import type { PreferredContact } from "@/types/marketplace";

interface InquiryFormProps {
  carId: string;
  carTitle: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
  preferredContact: PreferredContact;
}

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  message: "I am interested in this vehicle. Please share availability and next steps.",
  preferredContact: "email",
};

export function InquiryForm({ carId, carTitle }: InquiryFormProps) {
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.email.trim().length >= 5 &&
      form.message.trim().length >= 10,
    [form],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          carId,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          message: form.message,
          preferredContact: form.preferredContact,
        }),
      });

      const body = (await response.json()) as {
        error?: string;
        inquiryId?: string;
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to submit inquiry right now.");
      }

      setResult(
        `Inquiry submitted for ${carTitle}. Reference: ${body.inquiryId ?? "generated"}.`,
      );
      setForm(initialState);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="font-heading text-xl font-semibold text-slate-900">
        Ask About This Car
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        This marketplace uses a lead-generation workflow. Submit your contact details and questions to continue.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1 text-sm text-slate-700">
          Full name
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            minLength={2}
            maxLength={120}
          />
        </label>

        <label className="grid gap-1 text-sm text-slate-700">
          Email
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>

        <label className="grid gap-1 text-sm text-slate-700">
          Phone (optional)
          <input
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            maxLength={30}
          />
        </label>

        <label className="grid gap-1 text-sm text-slate-700">
          Preferred contact
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={form.preferredContact}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                preferredContact: event.target.value as PreferredContact,
              }))
            }
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm text-slate-700">
          Message
          <textarea
            className="min-h-28 rounded-lg border border-slate-300 px-3 py-2"
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            required
            minLength={10}
            maxLength={1500}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="mt-1 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Submitting..." : "Submit inquiry"}
        </button>
      </form>

      {result ? <p className="mt-3 text-sm text-emerald-700">{result}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
