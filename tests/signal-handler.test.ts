import { afterEach, describe, expect, test } from 'bun:test';
import {
  isProcessCancelled,
  removeSignalHandlers,
  resetCancellation,
  setupSignalHandlers,
} from '../src/utils/signal-handler';

afterEach(() => {
  removeSignalHandlers();
  resetCancellation();
});

describe('signal-handler', () => {
  test('cancels on SIGINT without exiting the process', () => {
    setupSignalHandlers();

    process.emit('SIGINT');

    expect(isProcessCancelled()).toBe(true);
  });

  test('installs only one handler per signal', () => {
    const before = process.listeners('SIGINT').length;

    setupSignalHandlers();
    setupSignalHandlers();

    expect(process.listeners('SIGINT')).toHaveLength(before + 1);
  });
});
