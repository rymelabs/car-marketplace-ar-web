import { getArEligibility } from "@/lib/ar";
import { makeId } from "@/lib/ids";
import {
  type CarsQuery,
  type CarListing,
  type CarListingWithModel,
  type CarModelAsset,
  type Inquiry,
  type ModelQaStatus,
  type ModelUploadItem,
  type UserRole,
} from "@/types/marketplace";
import {
  type CreateOrUpdateCarInput,
  type InquiryPayloadInput,
  type ModerateModelUploadInput,
} from "@/lib/validation";
import { seedCars, seedModels, seedModelUploads, seedUsers } from "@/data/seed";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { normalizeModelAssetUrl } from "@/lib/model-asset-url";

const useFirestore =
  process.env.USE_FIREBASE_DATA === "1" && Boolean(process.env.FIREBASE_PROJECT_ID);

const memoryState = {
  cars: [...seedCars],
  carModels: [...seedModels],
  inquiries: [] as Inquiry[],
  modelUploads: [...seedModelUploads],
  users: { ...seedUsers } as Record<string, UserRole>,
};

function sortCars(cars: CarListing[], sort: CarsQuery["sort"]): CarListing[] {
  const cloned = [...cars];

  switch (sort) {
    case "price-asc":
      return cloned.sort((a, b) => a.priceUSD - b.priceUSD);
    case "price-desc":
      return cloned.sort((a, b) => b.priceUSD - a.priceUSD);
    case "mileage-asc":
      return cloned.sort((a, b) => a.mileageMiles - b.mileageMiles);
    case "year-desc":
    default:
      return cloned.sort((a, b) => b.year - a.year);
  }
}

function filterCars(cars: CarListing[], query: CarsQuery): CarListing[] {
  const q = query.q?.trim().toLowerCase();
  const make = query.make?.trim().toLowerCase();

  return cars.filter((car) => {
    const fullText = `${car.make} ${car.model} ${car.trim} ${car.description}`.toLowerCase();

    if (q && !fullText.includes(q)) {
      return false;
    }

    if (make && car.make.toLowerCase() !== make) {
      return false;
    }

    if (query.minPrice !== undefined && car.priceUSD < query.minPrice) {
      return false;
    }

    if (query.maxPrice !== undefined && car.priceUSD > query.maxPrice) {
      return false;
    }

    return true;
  });
}

function attachModel(car: CarListing, modelAsset?: CarModelAsset): CarListingWithModel {
  const eligibility = getArEligibility(modelAsset);
  return {
    ...car,
    modelAsset,
    arEligible: eligibility.eligible,
    arIneligibleReason: eligibility.reason,
  };
}

async function listCarsFromFirestore(includeDraft: boolean): Promise<CarListing[]> {
  const db = getFirebaseAdminFirestore();
  const collection = db.collection("cars");
  const query = includeDraft
    ? collection
    : collection.where("status", "==", "published");

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as CarListing);
}

async function listModelsFromFirestore(): Promise<CarModelAsset[]> {
  const db = getFirebaseAdminFirestore();
  const snapshot = await db.collection("carModels").get();
  return snapshot.docs.map((doc) => doc.data() as CarModelAsset);
}

export async function listCars(
  query: CarsQuery = {},
  options: { includeDraft?: boolean } = {},
): Promise<CarListingWithModel[]> {
  const includeDraft = Boolean(options.includeDraft);

  const rawCars = useFirestore
    ? await listCarsFromFirestore(includeDraft)
    : memoryState.cars.filter((car) => (includeDraft ? true : car.status === "published"));

  const models = useFirestore ? await listModelsFromFirestore() : memoryState.carModels;
  const modelMap = new Map(models.map((model) => [model.id, model]));

  const filtered = filterCars(rawCars, query);
  const sorted = sortCars(filtered, query.sort);

  return sorted.map((car) => attachModel(car, modelMap.get(car.modelRefId)));
}

export async function getCarById(
  id: string,
  options: { includeDraft?: boolean } = {},
): Promise<CarListingWithModel | null> {
  const includeDraft = Boolean(options.includeDraft);

  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    const doc = await db.collection("cars").doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const car = doc.data() as CarListing;

    if (!includeDraft && car.status !== "published") {
      return null;
    }

    const modelDoc = await db.collection("carModels").doc(car.modelRefId).get();
    const model = modelDoc.exists ? (modelDoc.data() as CarModelAsset) : undefined;

    return attachModel(car, model);
  }

  const car = memoryState.cars.find((item) => item.id === id);

  if (!car || (!includeDraft && car.status !== "published")) {
    return null;
  }

  const model = memoryState.carModels.find((item) => item.id === car.modelRefId);
  return attachModel(car, model);
}

export async function createOrUpdateCar(input: CreateOrUpdateCarInput): Promise<CarListing> {
  const now = new Date().toISOString();
  const { modelAssetInput, modelRefId: providedModelRefId, ...carFields } = input;
  const carId = input.id ?? makeId("car");
  let resolvedModelRefId = providedModelRefId?.trim();

  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    const id = carId;

    const existing = await db.collection("cars").doc(id).get();
    const existingData = existing.exists ? (existing.data() as CarListing) : undefined;
    resolvedModelRefId = resolvedModelRefId ?? existingData?.modelRefId;

    if (modelAssetInput) {
      const modelId =
        modelAssetInput.id?.trim() ||
        resolvedModelRefId ||
        `model_${id}`;

      const modelValue: CarModelAsset = {
        id: modelId,
        carId: id,
        glbPath:
          normalizeModelAssetUrl(modelAssetInput.glbPath) ??
          modelAssetInput.glbPath,
        usdzPath: normalizeModelAssetUrl(modelAssetInput.usdzPath),
        dimensionsMeters: modelAssetInput.dimensionsMeters,
        normalizedScale: modelAssetInput.normalizedScale,
        qaStatus: modelAssetInput.qaStatus,
        sourceType: modelAssetInput.sourceType,
        approvedAt: modelAssetInput.qaStatus === "approved" ? now : undefined,
        version: existingData?.id ? "1.0.0" : "1.0.0",
      };

      await db.collection("carModels").doc(modelId).set(modelValue, { merge: true });
      resolvedModelRefId = modelId;
    }

    if (!resolvedModelRefId) {
      throw new Error(
        "Missing model reference. Provide modelRefId or modelAssetInput.",
      );
    }

    const nextValue: CarListing = {
      id,
      ...carFields,
      modelRefId: resolvedModelRefId,
      createdAt: existingData?.createdAt ?? now,
      updatedAt: now,
    };

    await db.collection("cars").doc(id).set(nextValue, { merge: true });
    return nextValue;
  }

  const existingIndex = input.id
    ? memoryState.cars.findIndex((car) => car.id === input.id)
    : -1;

  const existingCar = existingIndex >= 0 ? memoryState.cars[existingIndex] : undefined;
  resolvedModelRefId = resolvedModelRefId ?? existingCar?.modelRefId;

  if (modelAssetInput) {
    const modelId =
      modelAssetInput.id?.trim() ||
      resolvedModelRefId ||
      `model_${carId}`;

    const model: CarModelAsset = {
      id: modelId,
      carId,
      glbPath:
        normalizeModelAssetUrl(modelAssetInput.glbPath) ?? modelAssetInput.glbPath,
      usdzPath: normalizeModelAssetUrl(modelAssetInput.usdzPath),
      dimensionsMeters: modelAssetInput.dimensionsMeters,
      normalizedScale: modelAssetInput.normalizedScale,
      qaStatus: modelAssetInput.qaStatus,
      sourceType: modelAssetInput.sourceType,
      approvedAt: modelAssetInput.qaStatus === "approved" ? now : undefined,
      version: "1.0.0",
    };

    const modelIndex = memoryState.carModels.findIndex((item) => item.id === modelId);
    if (modelIndex >= 0) {
      memoryState.carModels[modelIndex] = {
        ...memoryState.carModels[modelIndex],
        ...model,
      };
    } else {
      memoryState.carModels.push(model);
    }

    resolvedModelRefId = modelId;
  }

  if (!resolvedModelRefId) {
    throw new Error("Missing model reference. Provide modelRefId or modelAssetInput.");
  }

  if (existingIndex >= 0) {
    const existing = memoryState.cars[existingIndex];
    const updated: CarListing = {
      ...existing,
      ...carFields,
      id: existing.id,
      modelRefId: resolvedModelRefId,
      updatedAt: now,
    };
    memoryState.cars[existingIndex] = updated;
    return updated;
  }

  const created: CarListing = {
    id: carId,
    ...carFields,
    modelRefId: resolvedModelRefId,
    createdAt: now,
    updatedAt: now,
  };

  memoryState.cars.push(created);
  return created;
}

export async function setCarPublishStatus(
  carId: string,
  publish: boolean,
): Promise<CarListingWithModel> {
  const car = await getCarById(carId, { includeDraft: true });

  if (!car) {
    throw new Error("Car not found");
  }

  if (publish && !car.arEligible) {
    throw new Error(
      car.arIneligibleReason ??
        "Cannot publish listing until 3D model passes true-scale QA.",
    );
  }

  const nextStatus: CarListing["status"] = publish ? "published" : "draft";
  const now = new Date().toISOString();

  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    await db.collection("cars").doc(carId).set(
      {
        status: nextStatus,
        updatedAt: now,
      },
      { merge: true },
    );
  } else {
    const index = memoryState.cars.findIndex((item) => item.id === carId);
    if (index < 0) {
      throw new Error("Car not found");
    }

    memoryState.cars[index] = {
      ...memoryState.cars[index],
      status: nextStatus,
      updatedAt: now,
    };
  }

  const updated = await getCarById(carId, { includeDraft: true });

  if (!updated) {
    throw new Error("Car not found after publish update");
  }

  return updated;
}

export async function createInquiry(input: InquiryPayloadInput): Promise<Inquiry> {
  const inquiry: Inquiry = {
    id: makeId("inq"),
    ...input,
    createdAt: new Date().toISOString(),
  };

  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    await db.collection("inquiries").doc(inquiry.id).set(inquiry);
  } else {
    memoryState.inquiries.push(inquiry);
  }

  return inquiry;
}

export async function listModelUploads(
  status: ModelQaStatus | "all" = "pending",
): Promise<ModelUploadItem[]> {
  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    const collection = db.collection("modelUploads");
    const query =
      status === "all" ? collection : collection.where("status", "==", status);

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as ModelUploadItem);
  }

  return memoryState.modelUploads.filter((item) =>
    status === "all" ? true : item.status === status,
  );
}

export async function moderateModelUpload(
  uploadId: string,
  payload: ModerateModelUploadInput,
  reviewerId: string,
): Promise<ModelUploadItem> {
  const reviewedAt = new Date().toISOString();

  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    const uploadRef = db.collection("modelUploads").doc(uploadId);
    const uploadDoc = await uploadRef.get();

    if (!uploadDoc.exists) {
      throw new Error("Model upload not found");
    }

    const upload = uploadDoc.data() as ModelUploadItem;
    const updated: ModelUploadItem = {
      ...upload,
      status: payload.status,
      notes: payload.notes,
      reviewedBy: reviewerId,
      reviewedAt,
    };

    await uploadRef.set(updated, { merge: true });

    if (payload.status === "approved") {
      await db
        .collection("carModels")
        .doc(`model_${upload.carId}`)
        .set(
          {
            id: `model_${upload.carId}`,
            carId: upload.carId,
            glbPath: upload.glbPath,
            usdzPath: upload.usdzPath,
            dimensionsMeters: upload.dimensionsMeters,
            normalizedScale: upload.normalizedScale,
            qaStatus: "approved",
            sourceType: "uploaded",
            approvedBy: reviewerId,
            approvedAt: reviewedAt,
            version: "1.0.0",
          } as CarModelAsset,
          { merge: true },
        );
    }

    return updated;
  }

  const index = memoryState.modelUploads.findIndex((item) => item.id === uploadId);
  if (index < 0) {
    throw new Error("Model upload not found");
  }

  const current = memoryState.modelUploads[index];

  const updated: ModelUploadItem = {
    ...current,
    status: payload.status,
    notes: payload.notes,
    reviewedBy: reviewerId,
    reviewedAt,
  };

  memoryState.modelUploads[index] = updated;

  if (payload.status === "approved") {
    const modelIndex = memoryState.carModels.findIndex(
      (item) => item.carId === current.carId,
    );
    const model: CarModelAsset = {
      id: `model_${current.carId}`,
      carId: current.carId,
      glbPath: current.glbPath,
      usdzPath: current.usdzPath,
      dimensionsMeters: current.dimensionsMeters,
      normalizedScale: current.normalizedScale,
      qaStatus: "approved",
      sourceType: "uploaded",
      approvedBy: reviewerId,
      approvedAt: reviewedAt,
      version: "1.0.0",
    };

    if (modelIndex >= 0) {
      memoryState.carModels[modelIndex] = model;
    } else {
      memoryState.carModels.push(model);
    }

    const carIndex = memoryState.cars.findIndex((item) => item.id === current.carId);
    if (carIndex >= 0) {
      memoryState.cars[carIndex] = {
        ...memoryState.cars[carIndex],
        modelRefId: model.id,
        updatedAt: reviewedAt,
      };
    }
  }

  return updated;
}

export async function getUserRole(userId: string): Promise<UserRole | undefined> {
  if (useFirestore) {
    const db = getFirebaseAdminFirestore();
    const doc = await db.collection("users").doc(userId).get();
    if (!doc.exists) {
      return undefined;
    }

    const role = doc.data()?.role;
    if (role === "admin" || role === "buyer") {
      return role;
    }

    return undefined;
  }

  return memoryState.users[userId];
}

export function listMakesFromCars(cars: CarListingWithModel[]): string[] {
  return Array.from(new Set(cars.map((car) => car.make))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function formatCurrencyUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMiles(miles: number): string {
  return `${new Intl.NumberFormat("en-US").format(miles)} mi`;
}
