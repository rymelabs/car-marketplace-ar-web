"use client";

import { FormEvent, useMemo, useState } from "react";
import { publicConfig } from "@/lib/config";
import type { ModelUploadItem } from "@/types/marketplace";

type ModelSourceMode = "existing" | "direct";

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
  status: "draft" | "published" | "archived";
  mediaUrl: string;
  mediaAlt: string;
  modelSourceMode: ModelSourceMode;
  modelRefId: string;
  glbPath: string;
  usdzPath: string;
  lengthMeters: string;
  widthMeters: string;
  heightMeters: string;
}

interface DriveModelFile {
  id: string;
  name: string;
  mimeType?: string;
  modelType: "glb" | "usdz";
  directUrl: string;
}

interface DriveFolderLookupResult {
  folderId: string;
  totalFilesScanned: number;
  glbFiles: DriveModelFile[];
  usdzFiles: DriveModelFile[];
  recommended?: {
    glbFile?: DriveModelFile;
    usdzFile?: DriveModelFile;
  };
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
  status: "draft",
  mediaUrl: "",
  mediaAlt: "",
  modelSourceMode: "direct",
  modelRefId: "",
  glbPath: "",
  usdzPath: "",
  lengthMeters: "4.70",
  widthMeters: "1.90",
  heightMeters: "1.55",
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

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildSuggestedCarId(form: CarFormState): string {
  const make = slugify(form.make);
  const model = slugify(form.model);
  const year = form.year.trim();

  if (!make || !model || !year) {
    return "";
  }

  return `car_${make}_${model}_${year}`;
}

export function AdminDashboard() {
  const [token, setToken] = useState("");
  const [carForm, setCarForm] = useState<CarFormState>(initialCarForm);
  const [driveFolder, setDriveFolder] = useState("");
  const [driveLookupResult, setDriveLookupResult] = useState<DriveFolderLookupResult | null>(null);
  const [driveLookupError, setDriveLookupError] = useState("");
  const [driveLookupMessage, setDriveLookupMessage] = useState("");
  const [isDriveLookupLoading, setIsDriveLookupLoading] = useState(false);
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

  const isDirectModelMode = carForm.modelSourceMode === "direct";

  const hasValidDirectModelInput = useMemo(() => {
    const hasGlb = carForm.glbPath.trim().length > 2;
    const length = Number(carForm.lengthMeters);
    const width = Number(carForm.widthMeters);
    const height = Number(carForm.heightMeters);

    return (
      hasGlb &&
      Number.isFinite(length) &&
      length > 0 &&
      Number.isFinite(width) &&
      width > 0 &&
      Number.isFinite(height) &&
      height > 0
    );
  }, [carForm.glbPath, carForm.heightMeters, carForm.lengthMeters, carForm.widthMeters]);

  const canSubmitCar = useMemo(
    () =>
      carForm.make.trim().length > 1 &&
      carForm.model.trim().length > 0 &&
      Number(carForm.year) > 1990 &&
      Number(carForm.priceUSD) > 0 &&
      Number(carForm.mileageMiles) >= 0 &&
      carForm.description.trim().length > 20 &&
      (isDirectModelMode ? hasValidDirectModelInput : carForm.modelRefId.trim().length > 1),
    [
      carForm.description,
      carForm.make,
      carForm.mileageMiles,
      carForm.model,
      carForm.modelRefId,
      carForm.priceUSD,
      carForm.year,
      hasValidDirectModelInput,
      isDirectModelMode,
    ],
  );

  function useSuggestedId() {
    const suggestion = buildSuggestedCarId(carForm);
    if (!suggestion) {
      return;
    }

    setCarForm((prev) => ({ ...prev, id: suggestion }));
  }

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

  async function loadDriveFolderAssets() {
    setDriveLookupError("");
    setDriveLookupMessage("");
    setDriveLookupResult(null);

    if (!driveFolder.trim()) {
      setDriveLookupError("Paste a Google Drive folder URL or folder ID first.");
      return;
    }

    setIsDriveLookupLoading(true);

    try {
      const query = new URLSearchParams({
        folder: driveFolder.trim(),
      });

      const response = await fetch(`/api/admin/drive/folder?${query.toString()}`, {
        headers: toAuthHeader(token),
      });

      const body = (await response.json()) as {
        error?: string;
        folderId?: string;
        totalFilesScanned?: number;
        glbFiles?: DriveModelFile[];
        usdzFiles?: DriveModelFile[];
        recommended?: {
          glbFile?: DriveModelFile;
          usdzFile?: DriveModelFile;
        };
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to load models from Google Drive.");
      }

      const lookup: DriveFolderLookupResult = {
        folderId: body.folderId ?? "",
        totalFilesScanned: body.totalFilesScanned ?? 0,
        glbFiles: body.glbFiles ?? [],
        usdzFiles: body.usdzFiles ?? [],
        recommended: body.recommended,
      };

      setDriveLookupResult(lookup);

      const preferredGlb = lookup.recommended?.glbFile ?? lookup.glbFiles[0];
      const preferredUsdz = lookup.recommended?.usdzFile ?? lookup.usdzFiles[0];

      if (preferredGlb || preferredUsdz) {
        setCarForm((prev) => ({
          ...prev,
          glbPath: preferredGlb?.directUrl ?? prev.glbPath,
          usdzPath: preferredUsdz?.directUrl ?? prev.usdzPath,
        }));
      }

      if (!preferredGlb) {
        setDriveLookupMessage(
          "Folder loaded, but no GLB file was found. Add at least one .glb file to continue.",
        );
      } else {
        setDriveLookupMessage(
          `Loaded folder ${lookup.folderId}. Found ${lookup.glbFiles.length} GLB and ${lookup.usdzFiles.length} USDZ file(s).`,
        );
      }
    } catch (error) {
      setDriveLookupError(
        error instanceof Error ? error.message : "Google Drive lookup failed.",
      );
    } finally {
      setIsDriveLookupLoading(false);
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
      const modelRefId = carForm.modelRefId.trim();
      const mediaUrl =
        carForm.mediaUrl.trim() ||
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80";
      const mediaAlt = carForm.mediaAlt.trim() || "Admin supplied listing photo";

      const response = await fetch("/api/admin/cars", {
        method: "POST",
        headers: toAuthHeader(token),
        body: JSON.stringify({
          id: carForm.id.trim() || undefined,
          make: carForm.make,
          model: carForm.model,
          year: Number(carForm.year),
          trim: carForm.trim,
          condition: carForm.condition,
          priceUSD: Number(carForm.priceUSD),
          mileageMiles: Number(carForm.mileageMiles),
          description: carForm.description,
          modelRefId: modelRefId || undefined,
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
              url: mediaUrl,
              alt: mediaAlt,
            },
          ],
          modelAssetInput: isDirectModelMode
            ? {
                id: modelRefId || undefined,
                glbPath: carForm.glbPath.trim(),
                usdzPath: carForm.usdzPath.trim() || undefined,
                dimensionsMeters: {
                  length: Number(carForm.lengthMeters),
                  width: Number(carForm.widthMeters),
                  height: Number(carForm.heightMeters),
                },
                normalizedScale: 1,
                qaStatus: "approved",
                sourceType: "curated",
              }
            : undefined,
        }),
      });

      const body = (await response.json()) as {
        error?: string;
        car?: { id: string; modelRefId: string };
      };

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to create or update listing.");
      }

      setCarResult(
        `Listing saved with ID: ${body.car?.id ?? "unknown"}. Model reference: ${
          body.car?.modelRefId ?? "not set"
        }`,
      );
      setCarForm(initialCarForm);
      setDriveFolder("");
      setDriveLookupResult(null);
      setDriveLookupError("");
      setDriveLookupMessage("");
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
          Simplified workflow: 1) add listing details, 2) attach model by ID or direct URLs, 3) publish.
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
        <p className="mt-1 text-sm text-slate-600">
          You can paste public Google Drive file links for models. Share links are converted to direct download links automatically.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmitCar}>
          <label className="grid gap-1 text-sm text-slate-700">
            Listing ID (optional)
            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={carForm.id}
                onChange={(event) => setCarForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="car_tesla_modely_2026"
              />
              <button
                type="button"
                onClick={useSuggestedId}
                className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900"
              >
                Generate
              </button>
            </div>
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
            Hero image URL (optional)
            <input
              type="url"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.mediaUrl}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, mediaUrl: event.target.value }))
              }
              placeholder="https://..."
            />
          </label>

          <label className="grid gap-1 text-sm text-slate-700">
            Hero image alt text (optional)
            <input
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={carForm.mediaAlt}
              onChange={(event) =>
                setCarForm((prev) => ({ ...prev, mediaAlt: event.target.value }))
              }
              placeholder="Front view of the car"
            />
          </label>

          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">3D Model Source</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCarForm((prev) => ({ ...prev, modelSourceMode: "direct" }))}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  isDirectModelMode
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                Direct Model URLs (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setCarForm((prev) => ({ ...prev, modelSourceMode: "existing" }))}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  !isDirectModelMode
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                Existing Model ID
              </button>
            </div>

            {!isDirectModelMode ? (
              <label className="mt-3 grid gap-1 text-sm text-slate-700">
                Existing Model Reference ID
                <input
                  required={!isDirectModelMode}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                  value={carForm.modelRefId}
                  onChange={(event) =>
                    setCarForm((prev) => ({ ...prev, modelRefId: event.target.value }))
                  }
                  placeholder="model_tesla_modely"
                />
              </label>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3 md:col-span-2">
                  <p className="text-sm font-semibold text-slate-900">Load Models From Google Drive Folder</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Paste a public folder URL/ID. SpawnDrive will fetch GLB/USDZ files and auto-fill recommended links.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={driveFolder}
                      onChange={(event) => setDriveFolder(event.target.value)}
                      placeholder="https://drive.google.com/drive/folders/... or folder ID"
                    />
                    <button
                      type="button"
                      onClick={loadDriveFolderAssets}
                      disabled={isDriveLookupLoading}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDriveLookupLoading ? "Loading..." : "Fetch Folder Files"}
                    </button>
                  </div>

                  {driveLookupMessage ? (
                    <p className="mt-2 text-xs text-emerald-700">{driveLookupMessage}</p>
                  ) : null}
                  {driveLookupError ? (
                    <p className="mt-2 text-xs text-rose-700">{driveLookupError}</p>
                  ) : null}

                  {driveLookupResult ? (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <p>
                        Folder ID: <span className="font-semibold text-slate-900">{driveLookupResult.folderId}</span>
                      </p>
                      <p>Scanned files: {driveLookupResult.totalFilesScanned}</p>
                      <p>Detected models: {driveLookupResult.glbFiles.length} GLB, {driveLookupResult.usdzFiles.length} USDZ</p>
                    </div>
                  ) : null}
                </div>

                <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
                  GLB URL or path
                  <input
                    required={isDirectModelMode}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.glbPath}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, glbPath: event.target.value }))
                    }
                    placeholder="/models/car_glb.glb or https://drive.google.com/file/d/..."
                  />
                </label>

                {driveLookupResult?.glbFiles.length ? (
                  <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
                    GLB files discovered in Drive folder
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={carForm.glbPath}
                      onChange={(event) =>
                        setCarForm((prev) => ({ ...prev, glbPath: event.target.value }))
                      }
                    >
                      {driveLookupResult.glbFiles.map((file) => (
                        <option key={file.id} value={file.directUrl}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
                  USDZ URL or path (optional, for iOS Quick Look)
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.usdzPath}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, usdzPath: event.target.value }))
                    }
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </label>

                {driveLookupResult?.usdzFiles.length ? (
                  <label className="grid gap-1 text-sm text-slate-700 md:col-span-2">
                    USDZ files discovered in Drive folder
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={carForm.usdzPath}
                      onChange={(event) =>
                        setCarForm((prev) => ({ ...prev, usdzPath: event.target.value }))
                      }
                    >
                      <option value="">No USDZ selected</option>
                      {driveLookupResult.usdzFiles.map((file) => (
                        <option key={file.id} value={file.directUrl}>
                          {file.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <label className="grid gap-1 text-sm text-slate-700">
                  Length (m)
                  <input
                    required={isDirectModelMode}
                    type="number"
                    step="0.01"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.lengthMeters}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, lengthMeters: event.target.value }))
                    }
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Width (m)
                  <input
                    required={isDirectModelMode}
                    type="number"
                    step="0.01"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.widthMeters}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, widthMeters: event.target.value }))
                    }
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Height (m)
                  <input
                    required={isDirectModelMode}
                    type="number"
                    step="0.01"
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.heightMeters}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, heightMeters: event.target.value }))
                    }
                  />
                </label>

                <label className="grid gap-1 text-sm text-slate-700">
                  Model ID override (optional)
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    value={carForm.modelRefId}
                    onChange={(event) =>
                      setCarForm((prev) => ({ ...prev, modelRefId: event.target.value }))
                    }
                    placeholder="model_custom_id"
                  />
                </label>

                <p className="md:col-span-2 text-xs text-slate-500">
                  Google Drive integration requires public file access and a configured server API key (`GOOGLE_DRIVE_API_KEY`).
                </p>
              </div>
            )}
          </div>

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
