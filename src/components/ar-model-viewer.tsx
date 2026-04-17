"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CarModelAsset } from "@/types/marketplace";
import { getArEligibility } from "@/lib/ar";
import { isGoogleDriveUrl, normalizeModelAssetUrl } from "@/lib/model-asset-url";

interface ArModelViewerProps {
  model?: CarModelAsset;
}

type ModelViewerElement = HTMLElement & {
  activateAR?: () => Promise<void>;
  canActivateAR?: boolean;
  dismissPoster?: () => void;
};

export function ArModelViewer({ model }: ArModelViewerProps) {
  const modelViewerRef = useRef<ModelViewerElement | null>(null);
  const [modelViewerLibraryReady, setModelViewerLibraryReady] = useState(false);
  const [modelViewerLibraryError, setModelViewerLibraryError] = useState("");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arLaunchError, setArLaunchError] = useState<string>("");
  const [isLaunchingAr, setIsLaunchingAr] = useState(false);
  const [isSecureContextReady, setIsSecureContextReady] = useState(true);

  const eligibility = useMemo(() => getArEligibility(model), [model]);
  const glbSrc = useMemo(
    () => normalizeModelAssetUrl(model?.glbPath),
    [model?.glbPath],
  );
  const usdzSrc = useMemo(
    () => normalizeModelAssetUrl(model?.usdzPath),
    [model?.usdzPath],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSecureContextReady(window.isSecureContext);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    import("@google/model-viewer")
      .then(() => {
        if (!isCancelled) {
          setModelViewerLibraryReady(true);
          setModelViewerLibraryError("");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setModelViewerLibraryError(
            "Unable to load 3D viewer on this device/browser.",
          );
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modelViewerLibraryReady) {
      return;
    }

    const viewer = modelViewerRef.current;
    if (!viewer) {
      return;
    }

    const onLoad = () => {
      setModelLoaded(true);
    };

    viewer.addEventListener("load", onLoad);

    return () => {
      viewer.removeEventListener("load", onLoad);
    };
  }, [model?.id, modelViewerLibraryReady]);

  async function handleViewInMySpace() {
    if (!eligibility.eligible) {
      setArLaunchError(eligibility.reason ?? "AR is currently unavailable for this listing.");
      return;
    }

    if (!modelViewerLibraryReady) {
      setArLaunchError("3D viewer is still loading. Try again in a moment.");
      return;
    }

    const viewer = modelViewerRef.current;

    if (!viewer || typeof viewer.activateAR !== "function") {
      setArLaunchError(
        "This browser cannot launch camera AR. Try iOS Safari or Android Chrome.",
      );
      return;
    }

    setArLaunchError("");
    setIsLaunchingAr(true);

    try {
      viewer.dismissPoster?.();
      await viewer.activateAR();
    } catch {
      setArLaunchError(
        "AR failed to launch on this device. You can still inspect and rotate the 3D model below.",
      );
    } finally {
      setIsLaunchingAr(false);
    }
  }

  if (!model) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-heading text-xl font-semibold text-slate-900">AR Preview</h2>
        <p className="mt-2 text-sm text-slate-600">
          3D model is not attached to this listing.
        </p>
      </section>
    );
  }

  const dimensions = model.dimensionsMeters;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl font-semibold text-slate-900">AR Preview</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            eligibility.eligible
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {eligibility.eligible ? "True-Scale AR Enabled" : "AR Disabled"}
        </span>
      </div>

      {eligibility.eligible ? (
        <p className="mb-3 text-sm text-slate-600">
          Click <span className="font-semibold">View in my Space</span> to open your camera and place the car at true scale.
        </p>
      ) : (
        <p className="mb-3 text-sm text-amber-700">{eligibility.reason}</p>
      )}

      <button
        type="button"
        onClick={handleViewInMySpace}
        disabled={
          !eligibility.eligible ||
          isLaunchingAr ||
          !modelLoaded ||
          !modelViewerLibraryReady
        }
        className="mb-3 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLaunchingAr ? "Launching AR..." : "View in my Space"}
      </button>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        <model-viewer
          ref={modelViewerRef}
          src={glbSrc}
          ios-src={usdzSrc}
          ar={eligibility.eligible}
          ar-modes="scene-viewer quick-look webxr"
          ar-placement="floor"
          camera-controls
          auto-rotate
          shadow-intensity="1"
          style={{ width: "100%", height: "420px", backgroundColor: "#f8fafc" }}
          reveal="interaction"
          touch-action="pan-y"
          poster=""
          alt="3D model preview of selected car"
        />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        <p>
          Model dimensions (meters): L {dimensions.length.toFixed(2)} x W {dimensions.width.toFixed(2)} x H{" "}
          {dimensions.height.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          In AR, drag to move and use two fingers to rotate/resize the car placement. Scale policy: 1 scene unit = 1 meter.
        </p>
      </div>

      {modelViewerLibraryError ? (
        <p className="mt-3 text-xs text-rose-700">{modelViewerLibraryError}</p>
      ) : null}
      {arLaunchError ? <p className="mt-3 text-xs text-rose-700">{arLaunchError}</p> : null}
      {!isSecureContextReady ? (
        <p className="mt-2 text-xs text-amber-700">
          Camera AR is blocked on non-HTTPS origins. Use localhost or deploy to HTTPS to test on a mobile device.
        </p>
      ) : null}
      {isGoogleDriveUrl(model.glbPath) || isGoogleDriveUrl(model.usdzPath) ? (
        <p className="mt-2 text-xs text-amber-700">
          Google Drive links must be publicly accessible. If AR fails, host the model in Firebase Storage or a CDN.
        </p>
      ) : null}
    </section>
  );
}
