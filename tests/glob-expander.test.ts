import { afterEach, describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expandGlobPattern, getRelativePath } from '../src/utils/glob-expander';

let temporaryDirectory = '';

afterEach(() => {
  if (temporaryDirectory) {
    rmSync(temporaryDirectory, { recursive: true, force: true });
    temporaryDirectory = '';
  }
});

describe('glob-expander', () => {
  test('expands recursive patterns from the input directory', async () => {
    temporaryDirectory = mkdtempSync(join(tmpdir(), 'rconv-glob-'));
    const nestedDirectory = join(temporaryDirectory, 'nested');
    mkdirSync(nestedDirectory);
    writeFileSync(join(temporaryDirectory, 'top.mp4'), '');
    writeFileSync(join(nestedDirectory, 'child.mp4'), '');
    writeFileSync(join(nestedDirectory, 'ignored.mov'), '');

    const files = await expandGlobPattern(join(temporaryDirectory, '*.mp4'), true);

    expect(files.sort()).toEqual([
      join(nestedDirectory, 'child.mp4'),
      join(temporaryDirectory, 'top.mp4'),
    ]);
  });

  test('does not create output subdirectories outside the input base directory', () => {
    expect(getRelativePath('/videos/party/clip.mp4', '/videos')).toBe('party/clip.mp4');
    expect(getRelativePath('/other/clip.mp4', '/videos')).toBe('');
  });
});
