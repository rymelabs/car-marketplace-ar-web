export type CarStatus = "draft" | "published" | "archived";

export type ModelQaStatus = "pending" | "approved" | "rejected";

export type ModelSourceType = "curated" | "uploaded";

export type UserRole = "buyer" | "admin";

export type PreferredContact = "email" | "phone";

export interface CarDimensionsMeters {
  length: number;
  width: number;
  height: number;
}

export interface CarMediaRef {
  id: string;
  url: string;
  alt: string;
}

export interface CarSpecs {
  drivetrain: string;
  fuelType: string;
  transmission: string;
  horsepower: number;
  exteriorColor: string;
  interiorColor: string;
}

export interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  condition: "new" | "used";
  priceUSD: number;
  mileageMiles: number;
  description: string;
  specs: CarSpecs;
  status: CarStatus;
  mediaRefs: CarMediaRef[];
  modelRefId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarModelAsset {
  id: string;
  carId: string;
  glbPath: string;
  usdzPath?: string;
  dimensionsMeters: CarDimensionsMeters;
  normalizedScale: number;
  qaStatus: ModelQaStatus;
  sourceType: ModelSourceType;
  checksum?: string;
  version?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Inquiry {
  id: string;
  carId: string;
  buyerId?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  preferredContact: PreferredContact;
  createdAt: string;
}

export interface ModelUploadItem {
  id: string;
  carId: string;
  submittedBy: string;
  glbPath: string;
  usdzPath?: string;
  dimensionsMeters: CarDimensionsMeters;
  normalizedScale: number;
  sourceType: "uploaded";
  status: ModelQaStatus;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CarListingWithModel extends CarListing {
  modelAsset?: CarModelAsset;
  arEligible: boolean;
  arIneligibleReason?: string;
}

export interface CarsQuery {
  q?: string;
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "year-desc" | "mileage-asc";
}
