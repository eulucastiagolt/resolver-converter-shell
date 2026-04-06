import { normalize, isAbsolute, resolve, dirname, basename } from 'node:path';

export function normalizePath(path: string): string {
  return normalize(path);
}

export function ensureAbsolute(path: string, basePath?: string): string {
  if (isAbsolute(path)) {
    return path;
  }
  return basePath ? resolve(basePath, path) : resolve(path);
}

export function removeTrailingSlash(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

export function getBaseDir(inputPath: string): string {
  const normalized = normalize(inputPath);
  
  if (!normalized.includes('/')) {
    return '.';
  }
  
  return dirname(normalized);
}

export function getFilePattern(inputPath: string): string {
  const normalized = normalize(inputPath);
  
  if (!normalized.includes('/')) {
    return normalized;
  }
  
  return basename(normalized);
}