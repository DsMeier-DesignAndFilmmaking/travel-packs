/**
 * Centralized content client.
 *
 * Why this abstraction matters:
 * - today: reads static JSON files from /public/data
 * - future: can switch to CDN/API/edge endpoints with no UI changes
 * - supports experimentation with AI-enriched fields without rewriting pages
 */
export class ContentClient {
  async getJson<T>(path: string): Promise<T> {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed content fetch: ${path} (${response.status})`);
    }

    return (await response.json()) as T;
  }
}

export const contentClient = new ContentClient();
