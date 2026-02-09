/**
 * Injects __BUILD_VERSION__ into src/sw.js for cache busting.
 * Writes injected content to src/sw.js and backs up the original to .cache/sw-original.js
 * so a Vite plugin can restore after build (keeps repo clean).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const swPath = join(root, 'src', 'sw.js');
const cacheDir = join(root, '.cache');
const backupPath = join(cacheDir, 'sw-original.js');

const buildVersion = process.env.BUILD_ENV === 'dev' ? 'dev' : String(Date.now());

const original = readFileSync(swPath, 'utf8');
const injected = original.replace(/__BUILD_VERSION__/g, buildVersion);

if (injected === original) {
  console.warn('[inject-build-version] No __BUILD_VERSION__ placeholder found in sw.js');
}

mkdirSync(cacheDir, { recursive: true });
writeFileSync(backupPath, original, 'utf8');
writeFileSync(swPath, injected, 'utf8');
console.log('[inject-build-version] Injected BUILD_VERSION:', buildVersion);
