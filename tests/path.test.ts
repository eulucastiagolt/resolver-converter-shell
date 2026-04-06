import { describe, test, expect } from 'bun:test';
import { removeTrailingSlash, getBaseDir, getFilePattern } from '../src/utils/path-utils';

describe('path-utils', () => {
  test('removeTrailingSlash should remove trailing slash', () => {
    expect(removeTrailingSlash('/path/to/dir/')).toBe('/path/to/dir');
    expect(removeTrailingSlash('/path/to/dir')).toBe('/path/to/dir');
  });

  test('getBaseDir should return directory path', () => {
    expect(getBaseDir('/path/to/video.mp4')).toBe('/path/to');
    expect(getBaseDir('video.mp4')).toBe('.');
  });

  test('getFilePattern should return filename', () => {
    expect(getFilePattern('/path/to/*.mp4')).toBe('*.mp4');
    expect(getFilePattern('*.mp4')).toBe('*.mp4');
  });
});