/**
 * CITY PACK SUMMARY
 * Used for high-level listing views (The "Catalog").
 * Optimized for lightweight data fetching and editorial layout.
 */
export interface CityPackSummary {
  slug: string;
  city: string;
  country: string;
  region: string;
  languageCodes: string[];
  heroImage?: string; 
  category?: string;      // e.g., "Coastal", "Urban", "Mountain"
  tags?: string[];        // e.g., ["Direct Tram", "Budget-Friendly"]
  updatedAt: string;
  priceLevel?: 1 | 2 | 3 | 4; 
  distanceFromCenter?: string; // e.g., "0.5 km from Old Town"
}

/**
 * VERSIONED SECTION
 * Narrative-first structure. The 'payload' is designed to be 
 * rendered with Markdown for professional typography.
 */
export interface VersionedSection {
  updatedAt?: string;
  version?: string;
  sourceIds?: string[];
  payload: {
    title: string;
    description: string;
    criticalAlert?: string; 
    highlight?: boolean;     
    
    summaryStats?: Array<{ 
      label: string; 
      value: string;         // Supports Markdown for "Bold Anchors"
      icon?: string; 
    }>;
    tips?: string[];         
  };
}

/**
 * FULL CITY PACK
 * The deep-dive content structure.
 * Standardized per Airbnb's "Listing Details" metadata requirements.
 */
/**
 * FULL CITY PACK
 * The deep-dive content structure.
 */
export interface CityPack {
  id: string;              // Added to resolve ts(2339)
  packId: string;          // Keep for legacy/backend compatibility
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
    symbol: string 
  };
  timezone: string;
  coordinates: { 
    lat: number; 
    lng: number 
  };
  /**
   * Map of key-value pairs. 
   * Common keys: 'arrival', 'money', 'safety', 'etiquette'
   */
  sections: Record<string, VersionedSection>;
}