import { existsSync } from 'node:fs';
import { basename, dirname, extname } from 'node:path';
import type { FileInfo } from '../types';

const VIDEO_EXTENSIONS = [
  '.mp4', '.avi', '.mkv', '.webm', '.mov', '.flv', '.mpeg', '.mpg', '.wmv', '.m4v', '.3gp', '.3g2'
];

export function getFileInfo(filePath: string): FileInfo {
  return {
    path: filePath,
    basename: basename(filePath),
    dirname: dirname(filePath),
    extension: extname(filePath),
    isValidVideo: false,
  };
}

export function fileExists(filePath: string): boolean {
  return existsSync(filePath);
}

export function isVideoFile(filePath: string): boolean {
  if (!fileExists(filePath)) {
    return false;
  }

  const ext = extname(filePath).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

export function getFileExtension(filePath: string): string {
  const ext = extname(filePath);
  return ext || '';
}

export function removeLastExtension(filename: string): string {
  const ext = extname(filename);
  if (ext) {
    return filename.slice(0, -ext.length);
  }
  return filename;
}

export function generateOutputFilename(inputPath: string, codecExtension: string = '.mov'): string {
  const base = basename(inputPath);
  const nameWithoutExt = removeLastExtension(base);
  
  if (!nameWithoutExt) {
    return `${base}${codecExtension}`;
  }
  
  return `${nameWithoutExt}${codecExtension}`;
}