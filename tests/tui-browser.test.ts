import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  createNamedOutputDirectory,
  createOutputDirectory,
  getDirectorySuggestions,
  getBrowserEntries,
  resolveDirectoryPath,
} from '../src/tui/browser';

let temporaryDirectory = '';

afterEach(() => {
  if (temporaryDirectory) {
    rmSync(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = '';
  }
});

describe('getBrowserEntries', () => {
  test('lists folders and supported videos without unrelated files', () => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'rconv-tui-'));
    mkdirSync(join(temporaryDirectory, 'clips'));
    writeFileSync(join(temporaryDirectory, 'birthday.MP4'), '');
    writeFileSync(join(temporaryDirectory, 'notes.txt'), '');

    const entries = getBrowserEntries(temporaryDirectory);

    expect(entries.map((entry) => [entry.name, entry.kind])).toEqual([
      ['..', 'parent'],
      ['birthday.MP4', 'video'],
      ['clips', 'directory'],
    ]);
  });

  test('creates uniquely named output directories', () => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'rconv-tui-'));

    expect(createOutputDirectory(temporaryDirectory)).toBe(join(temporaryDirectory, 'rconv-output'));
    expect(createOutputDirectory(temporaryDirectory)).toBe(join(temporaryDirectory, 'rconv-output-2'));
  });

  test('creates named directories and resolves typed relative paths', () => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'rconv-tui-'));
    mkdirSync(join(temporaryDirectory, 'clips'));

    expect(createNamedOutputDirectory(temporaryDirectory, 'Festa 2026')).toBe(
      join(temporaryDirectory, 'Festa 2026')
    );
    expect(resolveDirectoryPath('clips', temporaryDirectory)).toBe(join(temporaryDirectory, 'clips'));
    expect(resolveDirectoryPath('missing', temporaryDirectory)).toBeUndefined();
  });

  test('suggests matching directories for a typed path', () => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'rconv-tui-'));
    mkdirSync(join(temporaryDirectory, 'clips'));
    mkdirSync(join(temporaryDirectory, 'clipes-niver'));
    mkdirSync(join(temporaryDirectory, 'output'));

    expect(getDirectorySuggestions('cli', temporaryDirectory)).toEqual([
      join(temporaryDirectory, 'clipes-niver'),
      join(temporaryDirectory, 'clips'),
    ]);
    expect(getDirectorySuggestions('', temporaryDirectory)).toEqual([
      join(temporaryDirectory, 'clipes-niver'),
      join(temporaryDirectory, 'clips'),
      join(temporaryDirectory, 'output'),
    ]);
  });
});
