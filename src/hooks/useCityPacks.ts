import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getCitySlugFromPath, getStorageKey } from '@/utils/storageKeys';

export type DownloadStatus = 'not-downloaded' | 'downloading' | 'downloaded' | 'error';

export interface DownloadedPackMeta {
  cityId: string;
  downloadedAt: string;
}

interface StoredState {
  downloaded: Record<string, DownloadedPackMeta>;
}

interface UseCityPacksResult {
  downloadCityPack: (cityId: string) => Promise<void>;
  removeCityPack: (cityId: string) => Promise<void>;
  getPackStatus: (cityId: string) => DownloadStatus;
  listDownloadedPacks: () => DownloadedPackMeta[];
}

const CACHE_NAME = 'city-pack-json-v1';

function readStorageForKey(key: string): StoredState {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return { downloaded: {} };
  }
  try {
    return JSON.parse(raw) as StoredState;
  } catch {
    return { downloaded: {} };
  }
}

export function useCityPacks(): UseCityPacksResult {
  const { pathname } = useLocation();
  const slug = getCitySlugFromPath(pathname);
  const storageKey = slug ? getStorageKey('city', slug, 'downloaded.v1') : null;

  const [stored, setStored] = useState<StoredState>(() =>
    storageKey ? readStorageForKey(storageKey) : { downloaded: {} }
  );
  const [transientStatus, setTransientStatus] = useState<Record<string, DownloadStatus>>({});

  // When route (slug) changes, load that city's stored state; on home use empty state
  useEffect(() => {
    if (storageKey) {
      setStored(readStorageForKey(storageKey));
    } else {
      setStored({ downloaded: {} });
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    }
  }, [stored, storageKey]);

  const getPackStatus = useCallback(
    (cityId: string): DownloadStatus => {
      if (transientStatus[cityId]) {
        return transientStatus[cityId] as DownloadStatus;
      }

      return stored.downloaded[cityId] ? 'downloaded' : 'not-downloaded';
    },
    [stored.downloaded, transientStatus]
  );

  const listDownloadedPacks = useCallback((): DownloadedPackMeta[] => {
    return Object.values(stored.downloaded).sort((a, b) => b.downloadedAt.localeCompare(a.downloadedAt));
  }, [stored.downloaded]);

  const sendSwMessage = useCallback((message: unknown) => {
    if (!navigator.serviceWorker?.controller) {
      return;
    }

    navigator.serviceWorker.controller.postMessage(message);
  }, []);

  const downloadCityPack = useCallback(
    async (cityId: string): Promise<void> => {
      setTransientStatus((prev) => ({ ...prev, [cityId]: 'downloading' }));
  
      try {
        // 1. Fetch the JSON data
        const response = await fetch(`/data/city-packs/${cityId}.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch pack ${cityId}`);
  
        // Clone response to parse it AND cache it
        const data = await response.clone().json();
        const cache = await caches.open(CACHE_NAME);
  
        // 2. EXCELLENCE STEP: Pre-cache the hero image immediately
        // This ensures the "Home Page" and "Detail Page" images are ready instantly
        if (data.heroImage) {
          // We use { mode: 'no-cors' } if images are on a different CDN, 
          // but since yours are in /images/ (local), a standard fetch is fine.
          const imgResponse = await fetch(data.heroImage);
          if (imgResponse.ok) {
            await cache.put(data.heroImage, imgResponse);
          }
        }
  
        // 3. Store the JSON in cache
        await cache.put(`/data/city-packs/${cityId}.json`, response);
        
        // 4. Notify Service Worker and Update State
        sendSwMessage({ type: 'DOWNLOAD_CITY_PACK', payload: { cityId } });
  
        const downloadedAt = new Date().toISOString();
        setStored((prev) => ({
          downloaded: {
            ...prev.downloaded,
            [cityId]: { cityId, downloadedAt }
          }
        }));
  
        setTransientStatus((prev) => ({ ...prev, [cityId]: 'downloaded' }));
      } catch (error) {
        console.error("Download Error:", error);
        setTransientStatus((prev) => ({ ...prev, [cityId]: 'error' }));
      }
    },
    [sendSwMessage]
  );

  const removeCityPack = useCallback(
    async (cityId: string): Promise<void> => {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(`/data/city-packs/${cityId}.json`);
      sendSwMessage({ type: 'REMOVE_CITY_PACK', payload: { cityId } });

      setStored((prev) => {
        const next = { ...prev.downloaded };
        delete next[cityId];
        return { downloaded: next };
      });
      setTransientStatus((prev) => ({ ...prev, [cityId]: 'not-downloaded' }));
    },
    [sendSwMessage]
  );

  return useMemo(
    () => ({
      downloadCityPack,
      removeCityPack,
      getPackStatus,
      listDownloadedPacks
    }),
    [downloadCityPack, getPackStatus, listDownloadedPacks, removeCityPack]
  );
}
