import { describe, test, expect } from 'bun:test';
import { generateOutputFilename, removeLastExtension } from '../src/utils/file-validator';

describe('file-validator', () => {
  test('generateOutputFilename should remove extension and add .mov', () => {
    const result = generateOutputFilename('/path/to/video.mp4', '.mov');
    expect(result).toBe('video.mov');
  });

  test('generateOutputFilename should handle files with multiple dots', () => {
    const result = generateOutputFilename('/path/to/video.2023.10.18.final.mp4', '.mov');
    expect(result).toBe('video.2023.10.18.final.mov');
  });

  test('generateOutputFilename should handle files without extension', () => {
    const result = generateOutputFilename('/path/to/video', '.mov');
    expect(result).toBe('video.mov');
  });

  test('removeLastExtension should remove only the last extension', () => {
    expect(removeLastExtension('video.mp4')).toBe('video');
    expect(removeLastExtension('video.test.mp4')).toBe('video.test');
  });
});