import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const CACHE_PATH = join(homedir(), '.cache', 'rconv', 'update-check.json');
const REGISTRY_URL = 'https://registry.npmjs.org/@ltcode%2frconv/latest';

interface UpdateCache {
  checkedAt: number;
  latestVersion: string;
}

function readCache(): UpdateCache | undefined {
  try {
    if (!existsSync(CACHE_PATH)) {
      return undefined;
    }

    return JSON.parse(readFileSync(CACHE_PATH, 'utf8')) as UpdateCache;
  } catch {
    return undefined;
  }
}

function writeCache(latestVersion: string): void {
  try {
    mkdirSync(join(homedir(), '.cache', 'rconv'), { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify({ checkedAt: Date.now(), latestVersion }));
  } catch {
    // Failing to cache an update check must never affect conversions.
  }
}

export function isVersionNewer(latestVersion: string, currentVersion: string): boolean {
  const latest = latestVersion.replace(/^v/, '').split('-')[0].split('.').map(Number);
  const current = currentVersion.replace(/^v/, '').split('-')[0].split('.').map(Number);

  if (latest.length !== 3 || current.length !== 3 || [...latest, ...current].some(Number.isNaN)) {
    return false;
  }

  for (let index = 0; index < latest.length; index += 1) {
    if (latest[index] !== current[index]) {
      return latest[index] > current[index];
    }
  }

  return false;
}

export function formatUpdateMessage(currentVersion: string, latestVersion: string): string {
  return `Update available: ${currentVersion} → ${latestVersion}\nRun: npm install -g @ltcode/rconv@latest`;
}

export async function checkForUpdate(currentVersion: string): Promise<string | undefined> {
  const cache = readCache();

  if (cache && Date.now() - cache.checkedAt < CACHE_DURATION_MS) {
    return isVersionNewer(cache.latestVersion, currentVersion) ? cache.latestVersion : undefined;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(REGISTRY_URL, { signal: controller.signal });

    if (!response.ok) {
      return undefined;
    }

    const data = await response.json() as { version?: unknown };

    if (typeof data.version !== 'string') {
      return undefined;
    }

    writeCache(data.version);
    return isVersionNewer(data.version, currentVersion) ? data.version : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
