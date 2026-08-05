import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { isVideoFile } from '../utils/file-validator.js';

export interface BrowserEntry {
  name: string;
  path: string;
  kind: 'parent' | 'directory' | 'video';
}

export function getBrowserEntries(directory: string): BrowserEntry[] {
  const parent = dirname(directory);
  const entries = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry): BrowserEntry[] => {
      const path = join(directory, entry.name);

      if (entry.isDirectory()) {
        return [{ name: entry.name, path, kind: 'directory' }];
      }

      return entry.isFile() && isVideoFile(path)
        ? [{ name: entry.name, path, kind: 'video' }]
        : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return parent === directory
    ? entries
    : [{ name: '..', path: parent, kind: 'parent' }, ...entries];
}

export function createOutputDirectory(parentDirectory: string): string {
  const basePath = join(parentDirectory, 'rconv-output');
  let outputPath = basePath;
  let suffix = 2;

  while (existsSync(outputPath)) {
    outputPath = `${basePath}-${suffix}`;
    suffix += 1;
  }

  mkdirSync(outputPath);
  return outputPath;
}

export function createNamedOutputDirectory(parentDirectory: string, name: string): string {
  const trimmedName = name.trim();

  if (!trimmedName || basename(trimmedName) !== trimmedName || trimmedName === '.') {
    throw new Error('Informe um nome de pasta válido.');
  }

  const outputPath = join(parentDirectory, trimmedName);

  if (existsSync(outputPath)) {
    throw new Error('Já existe uma pasta com esse nome.');
  }

  mkdirSync(outputPath);
  return outputPath;
}

export function resolveDirectoryPath(pathInput: string, baseDirectory: string): string | undefined {
  const trimmedPath = pathInput.trim();
  const expandedPath = trimmedPath === '~' || trimmedPath.startsWith('~/')
    ? join(homedir(), trimmedPath.slice(2))
    : trimmedPath;
  const resolvedPath = isAbsolute(expandedPath)
    ? expandedPath
    : resolve(baseDirectory, expandedPath);

  try {
    return statSync(resolvedPath).isDirectory() ? resolvedPath : undefined;
  } catch {
    return undefined;
  }
}

export function getDirectorySuggestions(pathInput: string, baseDirectory: string): string[] {
  const trimmedPath = pathInput.trim();
  const expandedPath = trimmedPath === '~' || trimmedPath.startsWith('~/')
    ? join(homedir(), trimmedPath.slice(2))
    : trimmedPath;
  const resolvedPath = isAbsolute(expandedPath)
    ? expandedPath
    : resolve(baseDirectory, expandedPath);
  let parentDirectory = dirname(resolvedPath);
  let namePrefix = basename(resolvedPath).toLocaleLowerCase();

  if (!trimmedPath || trimmedPath.endsWith('/')) {
    parentDirectory = resolvedPath;
    namePrefix = '';
  }

  try {
    return readdirSync(parentDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .filter((entry) => entry.name.toLocaleLowerCase().startsWith(namePrefix))
      .map((entry) => join(parentDirectory, entry.name))
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 8);
  } catch {
    return [];
  }
}
