/**
 * Restores src/sw.js from the backup created by inject-build-version.js
 * so the repo is left with the original placeholder (no build artifact in source).
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const backupPath = join(root, '.cache', 'sw-original.js');
const swPath = join(root, 'src', 'sw.js');

if (!existsSync(backupPath)) {
  console.warn('[restore-sw] No backup found at', backupPath);
  process.exit(0);
}

const original = readFileSync(backupPath, 'utf8');
writeFileSync(swPath, original, 'utf8');
console.log('[restore-sw] Restored src/sw.js');
