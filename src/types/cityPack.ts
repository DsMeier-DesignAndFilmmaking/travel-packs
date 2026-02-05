export interface CityPackSummary {
  slug: string;
  city: string;
  country: string;
  region: string;
  languageCodes: string[];
  heroImage: string;
  tags: string[];
  updatedAt: string;
}

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
  currency: {
    code: string;
    symbol: string;
  };
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  sections: Record<string, VersionedSection>;
export interface CityPackSection {
  id: string;
  title: string;
  contentBlocks: Array<{
    type: 'markdown' | 'tips' | 'highlights';
    value: string | string[];
  }>;
}

export interface CityPack extends CityPackSummary {
  version: string;
  locale: string;
  sections: CityPackSection[];
  metadata: {
    timezone: string;
    currency: string;
    emergencyNumbers: string[];
  };
}
