"use client";

import { FormEvent, useMemo, useState } from "react";
import { publicConfig } from "@/lib/config";
import type { ModelUploadItem } from "@/types/marketplace";

interface CarFormState {
  id: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  condition: "new" | "used";
  priceUSD: string;
  mileageMiles: string;
  description: string;
  modelRefId: string;
  status: "draft" | "published" | "archived";
}

const initialCarForm: CarFormState = {
  id: "",
  make: "",
  model: "",
  year: String(new Date().getFullYear()),
  trim: "",
  condition: "used",
  priceUSD: "",
  mileageMiles: "",
  description: "",
  modelRefId: "",
  status: "draft",
};

function toAuthHeader(token: string): HeadersInit {
  if (!token.trim()) {
    return {
      "Content-Type": "application/json",
    };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token.trim()}`,
  };
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [carForm, setCarForm] = useState<CarFormState>(initialCarForm);
  const [carResult, setCarResult] = useState("");
  const [carError, setCarError] = useState("");

  const [publishCarId, setPublishCarId] = useState("");
  const [publishAction, setPublishAction] = useState<"publish" | "unpublish">(
    "publish",
  );
  const [publishResult, setPublishResult] = useState("");
  const [publishError, setPublishError] = useState("");

  const [uploads, setUploads] = useState<ModelUploadItem[]>([]);
  const [uploadsError, setUploadsError] = useState("");
  const [uploadsResult, setUploadsResult] = useState("");

  const canSubmitCar = useMemo(
    () =>
      carForm.make.trim().length > 1 &&
      carForm.model.trim().length > 0 &&
      Number(carForm.year) > 1990 &&
      Number(carForm.priceUSD) > 0 &&
      Number(carForm.mileageMiles) >= 0 &&
      carForm.description.trim().length > 20 &&
      carForm.modelRefId.trim().length > 1,
    [carForm],
  );

  async function loadUploads() {
    setUploadsError("");

    try {
      const response = await fetch("/api/admin/model-uploads?status=all", {
        headers: toAuthHeader(token),
      });

      const body = (await response.json()) as {
        error?: string;
        uploads?: ModelUploadItem[];
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to load model uploads.");
      }

      setUploads(body.uploads ?? []);
    } catch (error) {
      setUploadsError(error instanceof Error ? error.message : "Failed to load uploads");
    }
  }

  async function handleSubmitCar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmitCar) {
      return;
    }

    setCarError("");
    setCarResult("");

    try {
      const response = await fetch("/api/admin/cars", {
        method: "POST",
        headers: toAuthHeader(token),
        body: JSON.stringify({
          id: carForm.id || undefined,
          make: carForm.make,
          model: carForm.model,
          year: Number(carForm.year),
          trim: carForm.trim,
          condition: carForm.condition,
          priceUSD: Number(carForm.priceUSD),
          mileageMiles: Number(carForm.mileageMiles),
          description: carForm.description,
          modelRefId: carForm.modelRefId,
          status: carForm.status,
          specs: {
            drivetrain: "AWD",
            fuelType: "Electric",
            transmission: "Automatic",
            horsepower: 300,
            exteriorColor: "Black",
            interiorColor: "Black",
          },
          mediaRefs: [
            {
              id: "admin_media_1",
              url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80",
              alt: "Admin supplied listing photo",
            },
          ],
        }),
      });

      const body = (await response.json()) as { error?: string; car?: { id: string } };
      if (!response.ok) {
        throw new Error(body.error ?? "Unable to create or update listing.");
      }

      setCarResult(`Listing saved with ID: ${body.car?.id ?? "unknown"}`);
      setCarForm(initialCarForm);
    } catch (error) {
      setCarError(error instanceof Error ? error.message : "Save failed.");
    }
  }

  async function handlePublishToggle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPublishError("");
    setPublishResult("");

    try {
      const response = await fetch(`/api/admin/cars/${publishCarId}/publish`, {
        method: "PATCH",
        headers: toAuthHeader(token),
        body: JSON.stringify({ publish: publishAction === "publish" }),
      });

      const body = (await response.json()) as { error?: string; car?: { id: string; status: string } };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to update publish status.");
      }

      setPublishResult(
        `Listing ${body.car?.id ?? publishCarId} is now ${body.car?.status ?? "updated"}.`,
      );
      setPublishCarId("");
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : "Publish update failed.");
    }
  }

  async function moderateUpload(uploadId: string, status: "approved" | "rejected") {
    setUploadsError("");
    setUploadsResult("");

    try {
      const response = await fetch(`/api/admin/model-uploads/${uploadId}`, {
        method: "PATCH",
        headers: toAuthHeader(token),
        body: JSON.stringify({
          status,
          notes:
            status === "approved"
              ? "Model approved after scale and dimensions review."
              : "Model rejected due to QA review.",
        }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to moderate upload.");
      }

      setUploadsResult(`Upload ${uploadId} marked as ${status}.`);
      await loadUploads();
    } catch (error) {
      setUploadsError(error instanceof Error ? error.message : "Moderation failed.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h1 className="font-heading text-2xl font-semibold text-slate-900">Admin Portal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage listings, moderation queue, and publish states. Authentication can use Firebase ID token.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Demo admin bypass: {publicConfig.demoAdminBypass ? "enabled" : "disabled"}
        </p>

        <label className="mt-4 grid gap-1 text-sm text-slate-700">
          Firebase ID token (optional when demo bypass is enabled)
          <input
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Paste bearer token"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-heading text-xl font-semibold text-slate-900">Create or Update Listing</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmitCar}>
          <label className="grid gap-1 text-sm text-slate-700">
            Listing ID (optional for create)
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.id}
              onChange={(event) => setCarForm((prev) => ({ ...prev, id: event.target.value }))}
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Make
            <input
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.make}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, make: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Model
            <input
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.model}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, model: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Year
            <input
              required
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.year}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, year: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Trim
            <input
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.trim}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, trim: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Condition
            <select
              value={carForm.condition}
              className="rounded-lg border border-slate-300 px-3 py-2"
              onChange={(event) =>
                setCarForm((prev) => ({
                  ...prev,
                  condition: event.target.value as "new" | "used",
                }))
              }
            >
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Price (USD)
            <input
              required
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.priceUSD}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, priceUSD: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Mileage (miles)
            <input
              required
              type="number"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.mileageMiles}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, mileageMiles: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
            Description
            <textarea
              required
              minLength={20}
              className="min-h-24 rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.description}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, description: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Model Reference ID
            <input
              required
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.modelRefId}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, modelRefId: event.target.value }))
              }
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Status
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.status}
              onChange={(event) =>
                setCarForm((prev) => ({
                  ...prev,
                  status: event.target.value as "draft" | "published" | "archived",
                }))
              }
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!canSubmitCar}
              className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save listing
            </button>
          </div>
        </form>

        {carResult ? <p className="mt-3 text-sm text-emerald-700">{carResult}</p> : null}
        {carError ? <p className="mt-3 text-sm text-rose-700">{carError}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-heading text-xl font-semibold text-slate-900">Publish Control</h2>

        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={handlePublishToggle}>
          <label className="grid gap-1 text-sm text-slate-700">
            Car ID
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={publishCarId}
              onChange={(event) => setPublishCarId(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Action
            <select
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={publishAction}
              onChange={(event) =>
                setPublishAction(event.target.value as "publish" | "unpublish")
              }
            >
              <option value="publish">Publish</option>
              <option value="unpublish">Unpublish</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </form>

        {publishResult ? <p className="mt-3 text-sm text-emerald-700">{publishResult}</p> : null}
        {publishError ? <p className="mt-3 text-sm text-rose-700">{publishError}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-slate-900">Model Upload Queue</h2>
          <button
            type="button"
            onClick={loadUploads}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-950 hover:text-slate-950"
          >
            Refresh
          </button>
        </div>

        {uploads.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">
            No model uploads loaded. Use Refresh to fetch pending/processed uploads.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {uploads.map((upload) => (
              <li key={upload.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">{upload.id}</p>
                <p className="text-sm text-slate-700">Car ID: {upload.carId}</p>
                <p className="text-sm text-slate-700">Status: {upload.status}</p>
                <p className="text-sm text-slate-700">
                  Dimensions: {upload.dimensionsMeters.length}m x {upload.dimensionsMeters.width}m x{" "}
                  {upload.dimensionsMeters.height}m
                </p>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={() => moderateUpload(upload.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                    onClick={() => moderateUpload(upload.id, "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {uploadsResult ? <p className="mt-3 text-sm text-emerald-700">{uploadsResult}</p> : null}
        {uploadsError ? <p className="mt-3 text-sm text-rose-700">{uploadsError}</p> : null}
      </section>
    </div>
  );
}
