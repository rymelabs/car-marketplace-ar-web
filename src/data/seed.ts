import type {
  CarListing,
  CarModelAsset,
  ModelUploadItem,
  UserRole,
} from "@/types/marketplace";

const now = new Date().toISOString();

export const seedCars: CarListing[] = [
  {
    id: "car_tesla_modely_2024",
    make: "Tesla",
    model: "Model Y",
    year: 2024,
    trim: "Long Range AWD",
    condition: "used",
    priceUSD: 46800,
    mileageMiles: 7400,
    description:
      "Well-maintained 2024 Tesla Model Y Long Range with advanced driver-assistance package, premium interior, and dual-motor all-wheel drive.",
    specs: {
      drivetrain: "AWD",
      fuelType: "Electric",
      transmission: "Single-speed",
      horsepower: 425,
      exteriorColor: "Pearl White",
      interiorColor: "Black",
    },
    status: "published",
    mediaRefs: [
      {
        id: "media_tesla_1",
        url: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1400&q=80",
        alt: "Tesla Model Y parked outdoors",
      },
      {
        id: "media_tesla_2",
        url: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1400&q=80",
        alt: "Tesla interior dashboard",
      },
    ],
    modelRefId: "model_tesla_modely",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "car_ford_mustang_2023",
    make: "Ford",
    model: "Mustang",
    year: 2023,
    trim: "GT Premium",
    condition: "used",
    priceUSD: 42950,
    mileageMiles: 11500,
    description:
      "Iconic V8 performance coupe with premium leather interior, active exhaust, and sport-tuned suspension.",
    specs: {
      drivetrain: "RWD",
      fuelType: "Gasoline",
      transmission: "10-speed automatic",
      horsepower: 450,
      exteriorColor: "Rapid Red",
      interiorColor: "Ebony",
    },
    status: "published",
    mediaRefs: [
      {
        id: "media_mustang_1",
        url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1400&q=80",
        alt: "Red Ford Mustang front angle",
      },
    ],
    modelRefId: "model_ford_mustang",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "car_bmw_ix_2025",
    make: "BMW",
    model: "iX",
    year: 2025,
    trim: "xDrive50",
    condition: "new",
    priceUSD: 82400,
    mileageMiles: 20,
    description:
      "Luxury all-electric SUV with spacious cabin, panoramic glass roof, and adaptive air suspension.",
    specs: {
      drivetrain: "AWD",
      fuelType: "Electric",
      transmission: "Single-speed",
      horsepower: 516,
      exteriorColor: "Mineral White",
      interiorColor: "Mocha",
    },
    status: "draft",
    mediaRefs: [
      {
        id: "media_ix_1",
        url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80",
        alt: "BMW SUV profile",
      },
    ],
    modelRefId: "model_bmw_ix",
    createdAt: now,
    updatedAt: now,
  },
];

export const seedModels: CarModelAsset[] = [
  {
    id: "model_tesla_modely",
    carId: "car_tesla_modely_2024",
    glbPath: "/models/car_glb.glb",
    dimensionsMeters: {
      length: 4.75,
      width: 1.92,
      height: 1.62,
    },
    normalizedScale: 1,
    qaStatus: "approved",
    sourceType: "curated",
    checksum: "sha256:tesla-model-y-v1",
    version: "1.0.0",
    approvedBy: "seed-admin",
    approvedAt: now,
  },
  {
    id: "model_ford_mustang",
    carId: "car_ford_mustang_2023",
    glbPath: "/models/car_glb.glb",
    dimensionsMeters: {
      length: 4.81,
      width: 1.92,
      height: 1.39,
    },
    normalizedScale: 1,
    qaStatus: "approved",
    sourceType: "curated",
    checksum: "sha256:ford-mustang-v2",
    version: "2.1.0",
    approvedBy: "seed-admin",
    approvedAt: now,
  },
  {
    id: "model_bmw_ix",
    carId: "car_bmw_ix_2025",
    glbPath: "/models/car_glb.glb",
    dimensionsMeters: {
      length: 4.95,
      width: 1.97,
      height: 1.70,
    },
    normalizedScale: 1,
    qaStatus: "pending",
    sourceType: "uploaded",
    checksum: "sha256:bmw-ix-preview",
    version: "0.9.0",
  },
];

export const seedModelUploads: ModelUploadItem[] = [
  {
    id: "upload_bmw_ix_001",
    carId: "car_bmw_ix_2025",
    submittedBy: "uploader-demo",
    glbPath: "/models/car_glb.glb",
    dimensionsMeters: {
      length: 4.95,
      width: 1.97,
      height: 1.7,
    },
    normalizedScale: 1,
    sourceType: "uploaded",
    status: "pending",
    notes: "Awaiting calibration review.",
    createdAt: now,
  },
];

export const seedUsers: Record<string, UserRole> = {
  "demo-admin": "admin",
  "demo-buyer": "buyer",
};
