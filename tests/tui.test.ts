import { describe, expect, test } from 'bun:test';
import { runTui } from '../src/tui';

describe('runTui', () => {
  test('requires an interactive terminal', async () => {
    await expect(runTui()).rejects.toThrow('rconv tui requires an interactive terminal.');
  });
});
