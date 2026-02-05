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
