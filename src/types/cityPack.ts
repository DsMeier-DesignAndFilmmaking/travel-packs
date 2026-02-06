/**
 * CITY PACK SUMMARY
 * Used for high-level listing views (The "Catalog").
 * Optimized for lightweight data fetching and the 3-column Airbnb grid.
 */
export interface CityPackSummary {
  id: string;
  slug: string;
  city: string;
  country: string;
  region: string;
  heroImage?: string; 
  category?: string;      // e.g., "Metropolis", "Island", "Alpine"
  tags?: string[];        // e.g., ["QR Payments", "Walkable"]
  updatedAt: string;
  priceLevel?: 1 | 2 | 3 | 4; 
  languageCodes: string[];
  currencySymbol?: string; // <--- Add this line here  

}

/**
 * VERSIONED SECTION
 * Narrative-first structure. The 'payload' is the core content 
 * mapped to the SectionCard component.
 */
export interface VersionedSection {
  updatedAt?: string;
  version?: string;
  sourceIds?: string[];
  payload: {
    title: string;          // e.g., "Arriving at KLIA"
    description: string;    // Main markdown content
    criticalAlert?: string; // Highlighted callout text
    highlight?: boolean;    // UI flag for visual emphasis
    
    /**
     * Editorial Grid Data
     * e.g., { label: "Taxi", value: "RM75 (60 min)" }
     */
    summaryStats?: Array<{ 
      label: string; 
      value: string;        // Markdown-ready
      icon?: string; 
    }>;
    
    /**
     * Bulleted expert advice
     */
    tips?: string[];         
  };
}

/**
 * FULL CITY PACK
 * The deep-dive content structure.
 * Maps 1:1 with the detail view's editorial layout.
 */
export interface CityPack {
  // Identification
  id: string;              
  packId: string;          
  slug: string;

  // Geography & Metadata
  city: string;
  country: string;
  countryCode: string;
  region: string;
  updatedAt: string;
  version: string;
  languages: string[];

  // Logistics
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
   * Section Content
   * Use Record to allow for dynamic keys like 'arrival', 'money', 'safety', etc.
   */
  sections: Record<string, VersionedSection>;
}