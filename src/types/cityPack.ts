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

// Section content within a CityPack
export interface CityPackSection {
  id: string;
  title: string;
  contentBlocks: Array<{
    type: 'markdown' | 'tips' | 'highlights';
    value: string | string[];
  }>;
}

// Full CityPack type
export interface CityPack extends CityPackSummary {
  packId: string;
  countryCode: string;
  languages: string[];
  currency: {
    code: string;
    symbol: string;
  };
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  version: string;
  locale: string;

  // Sections as array for easy rendering
  sections: CityPackSection[];

  // Optional versioned sections map for API/AI integrations
  versionedSections?: Record<string, VersionedSection>;

  // Metadata such as emergency info
  metadata: {
    timezone: string;
    currency: string;
    emergencyNumbers: string[];
  };
}
