import { describe, expect, test } from 'bun:test';
import { formatUpdateMessage, isVersionNewer } from '../src/utils/update-checker';

describe('update-checker', () => {
  test('detects newer semantic versions', () => {
    expect(isVersionNewer('1.2.0', '1.1.1')).toBe(true);
    expect(isVersionNewer('1.1.2', '1.1.1')).toBe(true);
    expect(isVersionNewer('1.1.1', '1.1.1')).toBe(false);
    expect(isVersionNewer('1.0.9', '1.1.1')).toBe(false);
  });

  test('formats the npm update command', () => {
    expect(formatUpdateMessage('1.1.1', '1.2.0')).toBe(
      'Update available: 1.1.1 → 1.2.0\nRun: npm install -g @ltcode/rconv@latest'
    );
  });
});
