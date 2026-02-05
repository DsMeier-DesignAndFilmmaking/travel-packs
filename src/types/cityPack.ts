// src/types/cityPack.ts

// Summary info for city pack listings
export interface CityPackSummary {
  slug: string;
  city: string;
  country: string;
  region: string;
  languageCodes: string[];
  heroImage?: string;
  tags?: string[];
  updatedAt: string;
}

// Optional generic for versioned payloads
export interface VersionedSection<TPayload = unknown> {
  updatedAt: string;
  version: string;
  sourceIds?: string[];
  payload: TPayload;
}

export interface CityPack {
  packId: string;
  slug: string;
  city: string;
  country: string;
  countryCode: string;
  region: string;
  updatedAt: string;
  version: string;
  languages: string[];
  currency: { code: string; symbol: string };
  timezone: string;
  coordinates: { lat: number; lng: number };
  sections: Record<string, VersionedSection>; // <-- aligns with JSON schema
}
